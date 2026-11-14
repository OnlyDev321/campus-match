package com.campusmatch.security;

/**
 * Thrown when a BFF-to-backend SSO assertion cannot be trusted. Only the {@link Reason} is carried:
 * it never wraps the underlying parser exception, so neither the assertion nor any claim value can
 * leak into logs through this type.
 */
public class InvalidSsoAssertionException extends RuntimeException {

    public enum Reason {
        /** No signing secret is configured, so the endpoint is closed (fail closed). */
        NOT_CONFIGURED,
        /** Header absent, blank, oversized, not a JWS, or signed with an algorithm that is not allowed. */
        MALFORMED,
        /** Signature does not match (wrong key, or the header/payload was altered). */
        BAD_SIGNATURE,
        EXPIRED,
        ISSUER,
        AUDIENCE,
        /** The {@code sub} claim is absent or is not a plausible student ID. */
        SUBJECT,
        /** A required claim is absent or has the wrong type. */
        CLAIMS,
        /** Lifetime is not positive, longer than the allowed maximum, or issued in the future. */
        LIFETIME,
        /** The request body is not the one the assertion was issued for. */
        BODY_MISMATCH,
        /** The assertion id was already used (or the replay cache is full). */
        REPLAYED,
        /** The request body exceeds the size the bridge endpoint accepts. */
        BODY_TOO_LARGE
    }

    private final Reason reason;

    public InvalidSsoAssertionException(Reason reason) {
        super(reason.name(), null, false, false);
        this.reason = reason;
    }

    public Reason getReason() {
        return reason;
    }
}
