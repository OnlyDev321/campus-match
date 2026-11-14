package com.campusmatch.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.WeakKeyException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pins the observable behaviour of {@link JwtTokenProvider}: token format, claims, signing rule,
 * expiration policy and which tokens are rejected. They exist so that upgrading JJWT, Spring Boot
 * or the JDK cannot silently change how tokens are issued or validated.
 */
class JwtTokenProviderTest {

    private static final String STUDENT_ID = "20260020";
    private static final String ROLE = "ROLE_STUDENT";
    private static final String NAME = "Test Student";
    private static final long ONE_DAY_MS = 86_400_000L;

    /** Deterministic ASCII secret of an exact byte length (the key length selects HS256/HS384/HS512). */
    private static String secret(int bytes) {
        return "campus-match-test-secret-".repeat(4).substring(0, bytes);
    }

    private static String otherSecret(int bytes) {
        return "a-completely-different-secret-".repeat(3).substring(0, bytes);
    }

    private static JwtTokenProvider provider(String secret, long expirationMs) {
        return new JwtTokenProvider(secret, expirationMs);
    }

    private static String decodeSegment(String segment) {
        return new String(Base64.getUrlDecoder().decode(segment), StandardCharsets.UTF_8);
    }

    private static String encodeSegment(String text) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(text.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void generatedTokenCarriesExactlyTheExpectedClaims() {
        var provider = provider(secret(32), ONE_DAY_MS);

        String token = provider.generateToken(STUDENT_ID, ROLE, NAME);
        Claims claims = provider.getClaimsFromToken(token);

        assertEquals(Set.of("sub", "role", "name", "iat", "exp"), claims.keySet());
        assertEquals(STUDENT_ID, claims.getSubject());
        assertEquals(ROLE, claims.get("role", String.class));
        assertEquals(NAME, claims.get("name", String.class));
        assertEquals(STUDENT_ID, provider.getStudentIdFromToken(token));
        assertEquals(ROLE, provider.getRoleFromToken(token));
        assertEquals(NAME, provider.getNameFromToken(token));
    }

    @Test
    void koreanStudentNameRoundTripsThroughTheToken() {
        var provider = provider(secret(32), ONE_DAY_MS);

        String token = provider.generateToken(STUDENT_ID, ROLE, "김하늘");

        assertEquals("김하늘", provider.getNameFromToken(token));
        assertTrue(provider.validateToken(token));
    }

    @Test
    void expirationPolicyIsIssuedAtPlusConfiguredLifetime() {
        var provider = provider(secret(32), ONE_DAY_MS);

        Claims claims = provider.getClaimsFromToken(provider.generateToken(STUDENT_ID, ROLE, NAME));

        assertEquals(ONE_DAY_MS, provider.getExpirationMs());
        assertEquals(ONE_DAY_MS / 1000,
                (claims.getExpiration().getTime() - claims.getIssuedAt().getTime()) / 1000);
    }

    @ParameterizedTest
    @CsvSource({"32,HS256", "48,HS384", "64,HS512"})
    void signingAlgorithmFollowsTheSecretLength(int secretBytes, String expectedAlgorithm) {
        String token = provider(secret(secretBytes), ONE_DAY_MS).generateToken(STUDENT_ID, ROLE, NAME);

        String header = decodeSegment(token.split("\\.")[0]);

        assertTrue(header.contains("\"alg\":\"" + expectedAlgorithm + "\""), header);
    }

    @Test
    void signatureIsPlainHmacSha256OverHeaderAndPayloadWithUtf8SecretBytes() throws Exception {
        String secret = secret(32);
        String token = provider(secret, ONE_DAY_MS).generateToken(STUDENT_ID, ROLE, NAME);
        String[] parts = token.split("\\.");
        assertEquals(3, parts.length);

        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] expected = mac.doFinal((parts[0] + "." + parts[1]).getBytes(StandardCharsets.US_ASCII));

        assertEquals(Base64.getUrlEncoder().withoutPadding().encodeToString(expected), parts[2]);
    }

    @Test
    void validateTokenAcceptsFreshTokenOnlyForTheSameSecret() {
        var provider = provider(secret(32), ONE_DAY_MS);
        String token = provider.generateToken(STUDENT_ID, ROLE, NAME);

        assertTrue(provider.validateToken(token));
        assertFalse(provider(otherSecret(32), ONE_DAY_MS).validateToken(token));
    }

    @Test
    void expiredTokenIsRejected() {
        var provider = provider(secret(32), -1_000L);
        String token = provider.generateToken(STUDENT_ID, ROLE, NAME);

        assertFalse(provider.validateToken(token));
        assertThrows(ExpiredJwtException.class, () -> provider.getClaimsFromToken(token));
    }

    @Test
    void tamperedPayloadIsRejected() {
        var provider = provider(secret(32), ONE_DAY_MS);
        String[] parts = provider.generateToken(STUDENT_ID, ROLE, NAME).split("\\.");
        String payload = decodeSegment(parts[1]);
        assertTrue(payload.contains(ROLE));

        String forgedPayload = encodeSegment(payload.replace(ROLE, "ROLE_ADMIN"));

        assertFalse(provider.validateToken(parts[0] + "." + forgedPayload + "." + parts[2]));
    }

    @Test
    void unsecuredAlgNoneTokenIsRejected() {
        var provider = provider(secret(32), ONE_DAY_MS);
        String payload = provider.generateToken(STUDENT_ID, ROLE, NAME).split("\\.")[1];

        String unsecured = encodeSegment("{\"alg\":\"none\"}") + "." + payload + ".";

        assertFalse(provider.validateToken(unsecured));
    }

    @Test
    void malformedAndEmptyTokensAreRejected() {
        var provider = provider(secret(32), ONE_DAY_MS);

        assertFalse(provider.validateToken("not-a-jwt"));
        assertFalse(provider.validateToken("a.b.c"));
        assertFalse(provider.validateToken(""));
        assertFalse(provider.validateToken(null));
    }

    @Test
    void secretShorterThan256BitsIsRefusedAtStartup() {
        assertThrows(WeakKeyException.class, () -> provider("too-short", ONE_DAY_MS));
    }

    /**
     * Reference tokens minted by the previous JJWT release line (0.12.6) through this provider, with a
     * ~79-year lifetime and the test secrets above. Tokens already issued to students must stay valid
     * across upgrades (claims, algorithm selection by key length, secret handling). Not real credentials.
     */
    @ParameterizedTest
    @CsvSource({
        "32,eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyMDI2MDAyMCIsInJvbGUiOiJST0xFX1NUVURFTlQiLCJuYW1lIjoiVGVzdCBTdHVkZW50IiwiaWF0IjoxNzk0NjI1NDYzLCJleHAiOjQyOTQ2MjU0NjN9.gumT8SwzPnG98y43Vbw-45G1bw9tfN59Cx5bk0n7mnk",
        "48,eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiIyMDI2MDAyMCIsInJvbGUiOiJST0xFX1NUVURFTlQiLCJuYW1lIjoiVGVzdCBTdHVkZW50IiwiaWF0IjoxNzk0NjI1NDYzLCJleHAiOjQyOTQ2MjU0NjN9.OD56bzLXUgJviRvCBgB6MPqcafEn1u3R4jrmgDNXqPYhOe5f3olLlhpKAed7hyvF",
        "64,eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIyMDI2MDAyMCIsInJvbGUiOiJST0xFX1NUVURFTlQiLCJuYW1lIjoiVGVzdCBTdHVkZW50IiwiaWF0IjoxNzk0NjI1NDYzLCJleHAiOjQyOTQ2MjU0NjN9.sPoVYtuq7g2VApCxyDNyHvzn0SB0QvFJ043hzzCycpGusoBOFdkWLSAV3VEoG_fKIZFlKFsXTo3IFeAs_qUxyA"
    })
    void tokensIssuedByPreviousJjwtReleaseRemainValid(int secretBytes, String token) {
        var provider = provider(secret(secretBytes), ONE_DAY_MS);

        assertTrue(provider.validateToken(token));
        assertEquals(STUDENT_ID, provider.getStudentIdFromToken(token));
        assertEquals(ROLE, provider.getRoleFromToken(token));
        assertEquals(NAME, provider.getNameFromToken(token));
    }
}
