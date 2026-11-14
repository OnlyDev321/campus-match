package com.campusmatch.security;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

class SsoAssertionReplayGuardTest {

    private static final Instant START = Instant.parse("2027-01-15T08:00:00Z");

    /** A clock the test can move. */
    private static final class MovableClock extends Clock {
        private Instant now = START;

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }

    private final MovableClock clock = new MovableClock();
    private final SsoAssertionReplayGuard guard = new SsoAssertionReplayGuard(5, clock);

    @Test
    void anAssertionIdIsAcceptedOnceAndThenRejected() {
        Instant exp = START.plusSeconds(30);

        assertTrue(guard.tryConsume("jti-1", exp));
        assertFalse(guard.tryConsume("jti-1", exp));
        assertFalse(guard.tryConsume("jti-1", exp));
    }

    @Test
    void differentIdsAreIndependent() {
        Instant exp = START.plusSeconds(30);

        assertTrue(guard.tryConsume("jti-1", exp));
        assertTrue(guard.tryConsume("jti-2", exp));
    }

    @Test
    void anIdIsRememberedForAsLongAsTheVerifierCouldStillAcceptTheAssertion() {
        Instant exp = START.plusSeconds(30);
        assertTrue(guard.tryConsume("jti-1", exp));

        clock.advance(Duration.ofSeconds(30 + 5)); // exp + skew: the verifier still accepts the assertion here
        assertFalse(guard.tryConsume("jti-1", exp), "still inside the acceptance window");

        clock.advance(Duration.ofSeconds(2)); // past exp + skew + 1s: it can no longer pass verification anyway
        assertTrue(guard.tryConsume("jti-1", exp), "forgotten once it is unusable (memory stays bounded)");
    }

    @Test
    void refusesInsteadOfEvictingLiveEntriesWhenFull() {
        Instant exp = START.plusSeconds(30);
        for (int i = 0; i < SsoAssertionReplayGuard.MAX_TRACKED_ASSERTIONS; i++) {
            assertTrue(guard.tryConsume("jti-" + i, exp));
        }

        assertFalse(guard.tryConsume("one-too-many", exp), "fail closed");
        assertFalse(guard.tryConsume("jti-0", exp), "live entries are not evicted to make room");

        clock.advance(Duration.ofSeconds(60)); // everything has expired and is purged
        assertTrue(guard.tryConsume("one-too-many", START.plusSeconds(90)));
    }
}
