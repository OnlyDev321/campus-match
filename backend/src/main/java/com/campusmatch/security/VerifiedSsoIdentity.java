package com.campusmatch.security;

import java.time.Instant;

/**
 * The student identity vouched for by a verified BFF assertion.
 *
 * @param studentId   the {@code sub} claim: the only source of truth for who is logging in
 * @param assertionId the {@code jti} claim (one-time use)
 * @param expiresAt   the {@code exp} claim
 */
public record VerifiedSsoIdentity(String studentId, String assertionId, Instant expiresAt) {
}
