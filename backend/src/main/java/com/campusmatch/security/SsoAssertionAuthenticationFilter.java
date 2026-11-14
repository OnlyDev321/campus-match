package com.campusmatch.security;

import com.campusmatch.security.InvalidSsoAssertionException.Reason;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * Service-to-service authentication for {@code POST /api/auth/sso/usaint}: the only way to obtain an
 * authenticated {@link SsoBridgeAuthentication} is to present a valid BFF assertion.
 *
 * <p>Order of checks, cheapest and least-trusting first:
 * <ol>
 *   <li>exactly one {@code X-SSO-Assertion} header;</li>
 *   <li>signature, algorithm, issuer, audience, expiry, lifetime and claim shape (no body read yet, so an
 *       unauthenticated caller cannot make the server buffer anything);</li>
 *   <li>the body is within the size limit and its SHA-256 equals the signed {@code body_sha256};</li>
 *   <li>the assertion id has not been used before (consumed only now, after everything else checked out).</li>
 * </ol>
 * Any failure answers 401 (413 for an oversized body) with an empty reason, and nothing downstream runs.
 * The reason code is logged; the assertion, its claims and the student ID never are.
 *
 * <p>Deliberately not a Spring bean: a {@code Filter} bean would also be registered with the servlet
 * container outside the security chain. It is created by {@code SsoBridgeSecurityConfig}.
 */
@Slf4j
public class SsoAssertionAuthenticationFilter extends OncePerRequestFilter {

    public static final String ASSERTION_HEADER = "X-SSO-Assertion";
    /** A profile payload is a few KB (up to a base64 ID photo); 2 MiB is far above that and still bounded. */
    static final int MAX_BODY_BYTES = 2 * 1024 * 1024;

    private final SsoAssertionVerifier verifier;
    private final SsoAssertionReplayGuard replayGuard;

    public SsoAssertionAuthenticationFilter(SsoAssertionVerifier verifier, SsoAssertionReplayGuard replayGuard) {
        this.verifier = verifier;
        this.replayGuard = replayGuard;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        SecurityContextHolder.clearContext();
        try {
            VerifiedSsoAssertion assertion = verifier.verify(singleAssertionHeader(request));

            if (request.getContentLengthLong() > MAX_BODY_BYTES) {
                throw new InvalidSsoAssertionException(Reason.BODY_TOO_LARGE);
            }
            byte[] body = request.getInputStream().readNBytes(MAX_BODY_BYTES + 1);
            if (body.length > MAX_BODY_BYTES) {
                throw new InvalidSsoAssertionException(Reason.BODY_TOO_LARGE);
            }
            if (!assertion.matchesBody(body)) {
                throw new InvalidSsoAssertionException(Reason.BODY_MISMATCH);
            }

            VerifiedSsoIdentity identity = assertion.identity();
            if (!replayGuard.tryConsume(identity.assertionId(), identity.expiresAt())) {
                throw new InvalidSsoAssertionException(Reason.REPLAYED);
            }

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(new SsoBridgeAuthentication(identity));
            SecurityContextHolder.setContext(context);
            chain.doFilter(new CachedBodyHttpServletRequest(request, body), response);
        } catch (InvalidSsoAssertionException e) {
            SecurityContextHolder.clearContext();
            log.warn("Rejected SSO bridge request: reason={}", e.getReason());
            response.sendError(e.getReason() == Reason.BODY_TOO_LARGE
                    ? HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE
                    : HttpServletResponse.SC_UNAUTHORIZED);
        }
    }

    /** More than one header value is ambiguous, so it is treated like a missing one. */
    private static String singleAssertionHeader(HttpServletRequest request) {
        List<String> values = Collections.list(request.getHeaders(ASSERTION_HEADER));
        return values.size() == 1 ? values.get(0) : null;
    }
}
