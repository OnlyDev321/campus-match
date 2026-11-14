package com.campusmatch.security;

import com.campusmatch.security.InvalidSsoAssertionException.Reason;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.InvalidClaimException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.util.Date;
import java.util.HexFormat;
import java.util.regex.Pattern;

/**
 * Verifies the short-lived assertion the Next.js BFF attaches to {@code POST /api/auth/sso/usaint}.
 *
 * <p>The BFF is the only component that talks to the Soongsil u-SAINT portal. After it has verified the
 * student's u-SAINT credentials it signs an HS256 JWS with a secret shared only with this backend
 * ({@code SSO_ASSERTION_SECRET}, deliberately different from {@code JWT_SECRET}). This class decides whether
 * that assertion can be trusted; it keeps no state (one-time use is {@link SsoAssertionReplayGuard}'s job).
 *
 * <p>Required claims: {@code iss}, {@code aud}, {@code sub} (student ID), {@code iat}, {@code exp},
 * {@code jti}, and {@code body_sha256} (lowercase hex SHA-256 of the exact request body).
 *
 * <p>Fails closed: with no secret configured every assertion is rejected.
 */
@Slf4j
@Component
public class SsoAssertionVerifier {

    /** 256 bits: the minimum key size for HS256 (RFC 7518 section 3.2). */
    static final int MIN_SECRET_BYTES = 32;
    static final String BODY_DIGEST_CLAIM = "body_sha256";

    private static final int MAX_ASSERTION_CHARS = 4096;
    private static final int MAX_ASSERTION_ID_CHARS = 128;
    private static final int SHA_256_HEX_CHARS = 64;
    /** Input hygiene only (it fits the 20 character {@code users.student_id} column); NOT the authentication. */
    private static final Pattern STUDENT_ID = Pattern.compile("[A-Za-z0-9._-]{1,20}");

    private final JwtParser parser;
    private final long maxLifetimeSeconds;
    private final long clockSkewSeconds;
    private final Clock clock;

    @Autowired
    public SsoAssertionVerifier(
            @Value("${sso.assertion.secret:}") String secret,
            @Value("${jwt.secret}") String applicationJwtSecret,
            @Value("${sso.assertion.issuer:campus-match-bff}") String issuer,
            @Value("${sso.assertion.audience:campus-match-backend}") String audience,
            @Value("${sso.assertion.max-lifetime-seconds:60}") long maxLifetimeSeconds,
            @Value("${sso.assertion.clock-skew-seconds:5}") long clockSkewSeconds) {
        this(secret, applicationJwtSecret, issuer, audience, maxLifetimeSeconds, clockSkewSeconds, Clock.systemUTC());
    }

    SsoAssertionVerifier(String secret, String applicationJwtSecret, String issuer, String audience,
                         long maxLifetimeSeconds, long clockSkewSeconds, Clock clock) {
        this.maxLifetimeSeconds = maxLifetimeSeconds;
        this.clockSkewSeconds = clockSkewSeconds;
        this.clock = clock;

        if (secret == null || secret.isBlank()) {
            log.error("SSO assertion verification is DISABLED: sso.assertion.secret (env SSO_ASSERTION_SECRET) is not set. "
                    + "POST /api/auth/sso/usaint will reject every request until it is configured.");
            this.parser = null;
            return;
        }
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "sso.assertion.secret must be at least " + MIN_SECRET_BYTES + " bytes (256 bits)");
        }
        if (applicationJwtSecret != null
                && MessageDigest.isEqual(secretBytes, applicationJwtSecret.getBytes(StandardCharsets.UTF_8))) {
            throw new IllegalStateException("sso.assertion.secret must not be the same as jwt.secret");
        }
        SecretKey key = new SecretKeySpec(secretBytes, "HmacSHA256");
        this.parser = Jwts.parser()
                .verifyWith(key)
                .sig().clear().add(Jwts.SIG.HS256).and() // pin HS256: no alg=none, no algorithm switching
                .requireIssuer(issuer)
                .requireAudience(audience)
                .clockSkewSeconds(clockSkewSeconds)
                .clock(() -> Date.from(clock.instant()))
                .build();
    }

    /** {@code true} when a signing secret is configured (otherwise every assertion is rejected). */
    public boolean isConfigured() {
        return parser != null;
    }

    /**
     * Verifies signature, algorithm, issuer, audience, expiry, lifetime and the shape of the claims.
     * It does not look at the request body and does not consume the assertion id.
     *
     * @throws InvalidSsoAssertionException if the assertion cannot be trusted
     */
    public VerifiedSsoAssertion verify(String assertion) {
        if (parser == null) {
            throw new InvalidSsoAssertionException(Reason.NOT_CONFIGURED);
        }
        if (assertion == null || assertion.isBlank() || assertion.length() > MAX_ASSERTION_CHARS) {
            throw new InvalidSsoAssertionException(Reason.MALFORMED);
        }

        Jws<Claims> jws;
        try {
            jws = parser.parseSignedClaims(assertion);
        } catch (ExpiredJwtException e) {
            throw new InvalidSsoAssertionException(Reason.EXPIRED);
        } catch (InvalidClaimException e) { // MissingClaimException / IncorrectClaimException
            throw new InvalidSsoAssertionException(switch (String.valueOf(e.getClaimName())) {
                case Claims.ISSUER -> Reason.ISSUER;
                case Claims.AUDIENCE -> Reason.AUDIENCE;
                default -> Reason.CLAIMS;
            });
        } catch (SignatureException e) {
            throw new InvalidSsoAssertionException(Reason.BAD_SIGNATURE);
        } catch (JwtException | IllegalArgumentException e) {
            throw new InvalidSsoAssertionException(Reason.MALFORMED);
        }

        try {
            return toVerifiedAssertion(jws.getPayload());
        } catch (JwtException e) { // e.g. a claim that has the wrong JSON type
            throw new InvalidSsoAssertionException(Reason.CLAIMS);
        }
    }

    private VerifiedSsoAssertion toVerifiedAssertion(Claims claims) {
        String studentId = claims.getSubject();
        if (studentId == null || !STUDENT_ID.matcher(studentId).matches()) {
            throw new InvalidSsoAssertionException(Reason.SUBJECT);
        }

        String assertionId = claims.getId();
        Date issuedAt = claims.getIssuedAt();
        Date expiresAt = claims.getExpiration();
        String bodyDigest = claims.get(BODY_DIGEST_CLAIM, String.class);
        if (assertionId == null || assertionId.isBlank() || assertionId.length() > MAX_ASSERTION_ID_CHARS
                || issuedAt == null || expiresAt == null
                || bodyDigest == null || bodyDigest.length() != SHA_256_HEX_CHARS) {
            throw new InvalidSsoAssertionException(Reason.CLAIMS);
        }

        long lifetimeSeconds = expiresAt.toInstant().getEpochSecond() - issuedAt.toInstant().getEpochSecond();
        Instant now = clock.instant();
        if (lifetimeSeconds <= 0 || lifetimeSeconds > maxLifetimeSeconds
                || issuedAt.toInstant().isAfter(now.plusSeconds(clockSkewSeconds))) {
            throw new InvalidSsoAssertionException(Reason.LIFETIME);
        }

        byte[] digest;
        try {
            digest = HexFormat.of().parseHex(bodyDigest);
        } catch (IllegalArgumentException e) {
            throw new InvalidSsoAssertionException(Reason.CLAIMS);
        }
        return new VerifiedSsoAssertion(
                new VerifiedSsoIdentity(studentId, assertionId, expiresAt.toInstant()), digest);
    }
}
