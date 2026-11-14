package com.campusmatch.security;

import com.campusmatch.security.InvalidSsoAssertionException.Reason;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static com.campusmatch.security.SsoTestAssertions.SECRET;
import static com.campusmatch.security.SsoTestAssertions.assertion;
import static com.campusmatch.security.SsoTestAssertions.b64;
import static com.campusmatch.security.SsoTestAssertions.unb64;
import static org.junit.jupiter.api.Assertions.*;

/** Pins exactly which BFF assertions the backend trusts (unit level, no Spring, no database). */
class SsoAssertionVerifierTest {

    private static final String JWT_SECRET = "application-jwt-secret-0123456789-different-from-sso";
    private static final Instant NOW = Instant.parse("2027-01-15T08:00:00Z");
    private static final Clock CLOCK = Clock.fixed(NOW, ZoneOffset.UTC);
    private static final byte[] BODY = "{\"studentId\":\"20260001\",\"name\":\"김하늘\"}".getBytes(StandardCharsets.UTF_8);

    private final SsoAssertionVerifier verifier = verifier(SECRET);

    private static SsoAssertionVerifier verifier(String secret) {
        return new SsoAssertionVerifier(secret, JWT_SECRET, "campus-match-bff", "campus-match-backend", 60, 5, CLOCK);
    }

    private static SsoTestAssertions valid() {
        return assertion().issuedAt(NOW).body(BODY);
    }

    private Reason rejectionOf(String assertion) {
        return assertThrows(InvalidSsoAssertionException.class, () -> verifier.verify(assertion)).getReason();
    }

    @Test
    void validAssertionIsAcceptedAndCarriesTheVerifiedStudent() {
        VerifiedSsoAssertion result = verifier.verify(valid().subject("20260001").id("abc-123").build());

        assertEquals("20260001", result.identity().studentId());
        assertEquals("abc-123", result.identity().assertionId());
        assertEquals(NOW.plusSeconds(30), result.identity().expiresAt());
        assertTrue(result.matchesBody(BODY));
        assertFalse(result.matchesBody("{\"studentId\":\"20269999\"}".getBytes(StandardCharsets.UTF_8)));
    }

    /**
     * Wire-compatibility vector minted by the real BFF signer (frontend/src/lib/ssoAssertion.ts, Node, fixed clock,
     * throwaway test secret). If either side changes the format this fails before anything ships.
     */
    @Test
    void assertionMintedByTheRealBffSignerIsAccepted() {
        String secret = "bff-interop-test-secret-0123456789-abcdef";
        String assertion = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjYW1wdXMtbWF0Y2gtYmZmIiwiYXVkIjoiY2FtcHVzLW1hdGNoLWJhY2tlbmQiLCJzdWIiOiIyMDI2MDAwMSIsImlhdCI6MTgwMDAwMDAwMCwiZXhwIjoxODAwMDAwMDMwLCJqdGkiOiJpbnRlcm9wLXZlY3Rvci0wMDAxIiwiYm9keV9zaGEyNTYiOiJmMDMwZmEzZGQ0N2MzNDZkZWMwZmNjZTZjNzAwM2YwZWUxMDQ2NTFhOTJhZTM1Yjg2OWMyYjQ3MzdiOGVkYjg1In0.732iFeO2KF5bxovnChAcP0jT4_2JXCDYJPLNX8BxDi8";
        String body = "{\"studentId\":\"20260001\",\"name\":\"김하늘\",\"email\":\"20260001@soongsil.ac.kr\"}";
        Clock clock = Clock.fixed(Instant.ofEpochSecond(1_800_000_010L), ZoneOffset.UTC);

        VerifiedSsoAssertion result = new SsoAssertionVerifier(
                secret, JWT_SECRET, "campus-match-bff", "campus-match-backend", 60, 5, clock).verify(assertion);

        assertEquals("20260001", result.identity().studentId());
        assertEquals("interop-vector-0001", result.identity().assertionId());
        assertTrue(result.matchesBody(body.getBytes(StandardCharsets.UTF_8)), "digest must agree across Node and Java");
    }

    @Test
    void invalidSignatureIsRejected() {
        assertEquals(Reason.BAD_SIGNATURE, rejectionOf(valid().secret("a-completely-different-secret-0123456789-xyz").build()));
    }

    @Test
    void alteredPayloadIsRejected() {
        String[] parts = valid().subject("20260001").build().split("\\.");
        String forgedPayload = b64(unb64(parts[1]).replace("20260001", "20269999"));

        assertEquals(Reason.BAD_SIGNATURE, rejectionOf(parts[0] + "." + forgedPayload + "." + parts[2]));
    }

    @Test
    void alteredHeaderIsRejected() {
        String[] parts = valid().build().split("\\.");
        String forgedHeader = b64(unb64(parts[0]).replace("HS256", "HS384"));

        assertNotNull(rejectionOf(forgedHeader + "." + parts[1] + "." + parts[2]));
    }

    @Test
    void expiredAssertionIsRejected() {
        assertEquals(Reason.EXPIRED, rejectionOf(valid().issuedAt(NOW.minusSeconds(120)).build()));
    }

    @Test
    void assertionThatJustExpiredIsStillAcceptedInsideTheClockSkew() {
        // exp = now - 3s, skew = 5s
        assertDoesNotThrow(() -> verifier.verify(valid().issuedAt(NOW.minusSeconds(33)).build()));
        // exp = now - 10s, skew = 5s
        assertEquals(Reason.EXPIRED, rejectionOf(valid().issuedAt(NOW.minusSeconds(40)).build()));
    }

    @Test
    void wrongOrMissingIssuerIsRejected() {
        assertEquals(Reason.ISSUER, rejectionOf(valid().issuer("some-other-service").build()));
        assertEquals(Reason.ISSUER, rejectionOf(valid().issuer(null).build()));
    }

    @Test
    void wrongOrMissingAudienceIsRejected() {
        assertEquals(Reason.AUDIENCE, rejectionOf(valid().audience("some-other-backend").build()));
        assertEquals(Reason.AUDIENCE, rejectionOf(valid().audience(null).build()));
    }

    @Test
    void unsecuredAlgNoneAssertionIsRejected() {
        String payload = valid().build().split("\\.")[1];

        assertNotNull(rejectionOf(b64("{\"alg\":\"none\"}") + "." + payload + "."));
        assertNotNull(rejectionOf(b64("{\"alg\":\"none\"}") + "." + payload));
    }

    @Test
    void onlyHs256IsAcceptedEvenWithTheCorrectKeyMaterial() {
        String longSecret = "sso-assertion-test-secret-".repeat(4); // 104 bytes: long enough to sign with HS512
        SsoAssertionVerifier longKeyVerifier = verifier(longSecret);
        String hs512 = valid().secret(longSecret).hs512().build();

        assertThrows(InvalidSsoAssertionException.class, () -> longKeyVerifier.verify(hs512));
    }

    @Test
    void lifetimeMustBePositiveAndNotLongerThanTheMaximum() {
        assertEquals(Reason.LIFETIME, rejectionOf(valid().lifetimeSeconds(61).build()));
        assertEquals(Reason.LIFETIME, rejectionOf(valid().lifetimeSeconds(3600).build()));
        assertDoesNotThrow(() -> verifier.verify(valid().lifetimeSeconds(60).build()));
    }

    @Test
    void assertionIssuedInTheFutureIsRejected() {
        assertEquals(Reason.LIFETIME, rejectionOf(valid().issuedAt(NOW.plusSeconds(30)).build()));
        assertDoesNotThrow(() -> verifier.verify(valid().issuedAt(NOW.plusSeconds(3)).build()));
    }

    @Test
    void subjectMustBePresentAndPlausible() {
        assertEquals(Reason.SUBJECT, rejectionOf(valid().subject(null).build()));
        assertEquals(Reason.SUBJECT, rejectionOf(valid().subject("").build()));
        assertEquals(Reason.SUBJECT, rejectionOf(valid().subject("2026 0001").build()));
        assertEquals(Reason.SUBJECT, rejectionOf(valid().subject("20260001'; DROP TABLE users;--").build()));
        assertEquals(Reason.SUBJECT, rejectionOf(valid().subject("1".repeat(21)).build()));
    }

    @Test
    void requiredClaimsMustBePresentAndWellFormed() {
        assertEquals(Reason.CLAIMS, rejectionOf(valid().id(null).build()));
        assertEquals(Reason.CLAIMS, rejectionOf(valid().id("x".repeat(129)).build()));
        assertEquals(Reason.CLAIMS, rejectionOf(valid().omitBodyDigest().build()));
        assertEquals(Reason.CLAIMS, rejectionOf(valid().bodyDigest("abc").build()));
        assertEquals(Reason.CLAIMS, rejectionOf(valid().bodyDigest("z".repeat(64)).build()));
    }

    @Test
    void anApplicationJwtCannotBeUsedAsAnAssertion() {
        String applicationJwt = new JwtTokenProvider(JWT_SECRET, 86_400_000L)
                .generateToken("20260001", "ROLE_STUDENT", "Test Student");

        assertNotNull(rejectionOf(applicationJwt));
    }

    @Test
    void malformedInputIsRejected() {
        assertEquals(Reason.MALFORMED, rejectionOf(null));
        assertEquals(Reason.MALFORMED, rejectionOf(""));
        assertEquals(Reason.MALFORMED, rejectionOf("   "));
        assertEquals(Reason.MALFORMED, rejectionOf("not-a-jwt"));
        assertEquals(Reason.MALFORMED, rejectionOf("a.b.c"));
        assertEquals(Reason.MALFORMED, rejectionOf("a".repeat(5000)));
    }

    @Test
    void withoutAConfiguredSecretEveryAssertionIsRejected() {
        for (String blank : new String[] {"", "   ", null}) {
            SsoAssertionVerifier unconfigured = verifier(blank);

            assertFalse(unconfigured.isConfigured());
            InvalidSsoAssertionException ex = assertThrows(InvalidSsoAssertionException.class,
                    () -> unconfigured.verify(valid().build()));
            assertEquals(Reason.NOT_CONFIGURED, ex.getReason());
        }
        assertTrue(verifier.isConfigured());
    }

    @Test
    void weakSecretIsRefusedAtStartup() {
        assertThrows(IllegalStateException.class, () -> verifier("too-short-secret"));
        assertThrows(IllegalStateException.class, () -> verifier("x".repeat(31)));
        assertDoesNotThrow(() -> verifier("x".repeat(32)));
    }

    @Test
    void secretEqualToTheApplicationJwtSecretIsRefusedAtStartup() {
        assertThrows(IllegalStateException.class, () -> verifier(JWT_SECRET));
    }

    @Test
    void rejectionNeverCarriesTheAssertionOrItsClaims() {
        String assertion = valid().subject("20260001").secret("a-completely-different-secret-0123456789-xyz").build();

        InvalidSsoAssertionException ex = assertThrows(InvalidSsoAssertionException.class, () -> verifier.verify(assertion));

        assertEquals("BAD_SIGNATURE", ex.getMessage());
        assertNull(ex.getCause());
    }
}
