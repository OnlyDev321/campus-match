package com.campusmatch.security;

import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Test-only minter of BFF assertions. Every field defaults to a valid value so each test can break exactly one
 * property. The secrets here are throwaway test values, not credentials.
 */
final class SsoTestAssertions {

    static final String SECRET = "sso-assertion-test-secret-0123456789-abcdef-sso";
    static final String ISSUER = "campus-match-bff";
    static final String AUDIENCE = "campus-match-backend";

    private String secret = SECRET;
    private String issuer = ISSUER;
    private String audience = AUDIENCE;
    private String subject = "20260001";
    private Instant issuedAt = Instant.now();
    private long lifetimeSeconds = 30;
    private String id = UUID.randomUUID().toString();
    private byte[] body = new byte[0];
    private String bodyDigest;
    private boolean omitBodyDigest;
    private boolean hs512;

    static SsoTestAssertions assertion() {
        return new SsoTestAssertions();
    }

    static String sha256Hex(byte[] body) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(body));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    static String b64(String text) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(text.getBytes(StandardCharsets.UTF_8));
    }

    static String unb64(String segment) {
        return new String(Base64.getUrlDecoder().decode(segment), StandardCharsets.UTF_8);
    }

    SsoTestAssertions secret(String value) { this.secret = value; return this; }
    SsoTestAssertions issuer(String value) { this.issuer = value; return this; }
    SsoTestAssertions audience(String value) { this.audience = value; return this; }
    SsoTestAssertions subject(String value) { this.subject = value; return this; }
    SsoTestAssertions issuedAt(Instant value) { this.issuedAt = value; return this; }
    SsoTestAssertions lifetimeSeconds(long value) { this.lifetimeSeconds = value; return this; }
    SsoTestAssertions id(String value) { this.id = value; return this; }
    SsoTestAssertions body(byte[] value) { this.body = value; return this; }
    SsoTestAssertions body(String value) { return body(value.getBytes(StandardCharsets.UTF_8)); }
    SsoTestAssertions bodyDigest(String value) { this.bodyDigest = value; return this; }
    SsoTestAssertions omitBodyDigest() { this.omitBodyDigest = true; return this; }
    SsoTestAssertions hs512() { this.hs512 = true; return this; }

    String build() {
        JwtBuilder builder = Jwts.builder();
        if (issuer != null) builder.issuer(issuer);
        if (audience != null) builder.audience().add(audience);
        if (subject != null) builder.subject(subject);
        if (id != null) builder.id(id);
        if (!omitBodyDigest) builder.claim("body_sha256", bodyDigest != null ? bodyDigest : sha256Hex(body));
        builder.issuedAt(Date.from(issuedAt)).expiration(Date.from(issuedAt.plusSeconds(lifetimeSeconds)));

        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return hs512
                ? builder.signWith(new SecretKeySpec(keyBytes, "HmacSHA512"), Jwts.SIG.HS512).compact()
                : builder.signWith(new SecretKeySpec(keyBytes, "HmacSHA256"), Jwts.SIG.HS256).compact();
    }
}
