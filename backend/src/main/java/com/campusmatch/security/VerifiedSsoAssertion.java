package com.campusmatch.security;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * A signature-checked assertion: the vouched identity plus the SHA-256 of the exact request body the BFF
 * signed for. The body digest ties the profile payload to the signature, so the payload cannot be swapped
 * or edited in transit by anyone who does not hold the signing secret.
 */
public final class VerifiedSsoAssertion {

    private final VerifiedSsoIdentity identity;
    private final byte[] bodySha256;

    public VerifiedSsoAssertion(VerifiedSsoIdentity identity, byte[] bodySha256) {
        this.identity = identity;
        this.bodySha256 = bodySha256.clone();
    }

    public VerifiedSsoIdentity identity() {
        return identity;
    }

    /** Constant-time comparison of the signed digest with the digest of the body actually received. */
    public boolean matchesBody(byte[] body) {
        try {
            return MessageDigest.isEqual(MessageDigest.getInstance("SHA-256").digest(body), bodySha256);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is required by the Java platform", e);
        }
    }
}
