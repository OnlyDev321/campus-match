package com.campusmatch.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Makes every SSO assertion single-use: an assertion id ({@code jti}) is accepted once and then remembered
 * until the assertion could no longer pass the expiry check, so a captured assertion cannot be replayed.
 *
 * <p><b>Trade-off:</b> the memory is process-local because the project has no shared store (no Redis, and a
 * database table would be a schema change). With one backend instance this is exact. A restart forgets the
 * ids, so a replay inside the remaining lifetime (at most {@code max-lifetime-seconds + clock-skew-seconds})
 * would succeed after a restart, and N instances would accept one replay each. Moving to a shared store is
 * the fix if the backend is ever scaled out; the assertion's short lifetime and body binding bound the
 * exposure until then.
 *
 * <p>Only call this with an assertion whose signature has already been verified, so unauthenticated callers
 * cannot fill the cache. If the cache is full it refuses (fail closed) instead of evicting live entries.
 */
@Component
public class SsoAssertionReplayGuard {

    static final int MAX_TRACKED_ASSERTIONS = 10_000;

    private final Map<String, Instant> retainedUntil = new HashMap<>();
    private final long clockSkewSeconds;
    private final Clock clock;

    @Autowired
    public SsoAssertionReplayGuard(@Value("${sso.assertion.clock-skew-seconds:5}") long clockSkewSeconds) {
        this(clockSkewSeconds, Clock.systemUTC());
    }

    SsoAssertionReplayGuard(long clockSkewSeconds, Clock clock) {
        this.clockSkewSeconds = clockSkewSeconds;
        this.clock = clock;
    }

    /**
     * @return {@code true} the first time this id is seen; {@code false} for a replay (or when the cache is full)
     */
    public synchronized boolean tryConsume(String assertionId, Instant expiresAt) {
        Instant now = clock.instant();
        retainedUntil.values().removeIf(until -> !until.isAfter(now));
        if (retainedUntil.containsKey(assertionId) || retainedUntil.size() >= MAX_TRACKED_ASSERTIONS) {
            return false;
        }
        // The verifier still accepts an assertion until exp + skew, so remember it slightly longer than that.
        retainedUntil.put(assertionId, expiresAt.plusSeconds(clockSkewSeconds + 1));
        return true;
    }
}
