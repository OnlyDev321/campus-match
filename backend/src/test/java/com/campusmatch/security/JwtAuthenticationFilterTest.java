package com.campusmatch.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pins how {@link JwtAuthenticationFilter} turns a Bearer token into a Spring Security
 * authentication, and that it never blocks the chain itself (rejection is the job of the
 * authorization rules in SecurityConfig).
 */
class JwtAuthenticationFilterTest {

    private static final String SECRET = "filter-test-secret-".repeat(4);
    private static final long ONE_DAY_MS = 86_400_000L;

    private final JwtTokenProvider tokenProvider = new JwtTokenProvider(SECRET, ONE_DAY_MS);
    private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(tokenProvider);

    @BeforeEach
    void clearContextBefore() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearContextAfter() {
        SecurityContextHolder.clearContext();
    }

    private MockFilterChain run(String authorizationHeader) throws Exception {
        var request = new MockHttpServletRequest("GET", "/api/users/me");
        if (authorizationHeader != null) {
            request.addHeader("Authorization", authorizationHeader);
        }
        var chain = new MockFilterChain();
        filter.doFilter(request, new MockHttpServletResponse(), chain);
        return chain;
    }

    private static List<String> authorities(Authentication authentication) {
        return authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
    }

    @Test
    void validBearerTokenAuthenticatesTheStudentWithTheRoleFromTheClaim() throws Exception {
        String token = tokenProvider.generateToken("20260020", "ROLE_STUDENT", "Test Student");

        var chain = run("Bearer " + token);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertTrue(authentication.isAuthenticated());
        assertEquals("20260020", authentication.getName());
        assertNull(authentication.getCredentials());
        assertEquals(List.of("ROLE_STUDENT"), authorities(authentication));
        assertNotNull(chain.getRequest(), "the filter must hand the request on");
    }

    @Test
    void roleClaimIsUsedAsTheOnlyAuthority() throws Exception {
        String token = tokenProvider.generateToken("20260020", "ROLE_ADMIN", "Test Admin");

        run("Bearer " + token);

        assertEquals(List.of("ROLE_ADMIN"), authorities(SecurityContextHolder.getContext().getAuthentication()));
    }

    @Test
    void missingOrBlankRoleClaimFallsBackToRoleStudent() throws Exception {
        String withoutRole = Jwts.builder()
                .subject("20260020")
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();
        String blankRole = tokenProvider.generateToken("20260020", "   ", "Test Student");

        run("Bearer " + withoutRole);
        assertEquals(List.of("ROLE_STUDENT"), authorities(SecurityContextHolder.getContext().getAuthentication()));

        SecurityContextHolder.clearContext();
        run("Bearer " + blankRole);
        assertEquals(List.of("ROLE_STUDENT"), authorities(SecurityContextHolder.getContext().getAuthentication()));
    }

    @Test
    void invalidOrMissingCredentialsLeaveTheRequestUnauthenticatedButContinueTheChain() throws Exception {
        String valid = tokenProvider.generateToken("20260020", "ROLE_STUDENT", "Test Student");
        String expired = new JwtTokenProvider(SECRET, -1_000L).generateToken("20260020", "ROLE_STUDENT", "Test Student");
        String foreign = new JwtTokenProvider("some-other-secret-".repeat(4), ONE_DAY_MS)
                .generateToken("20260020", "ROLE_ADMIN", "Intruder");

        for (String header : Stream.of(null, "", "Bearer ", "Bearer not-a-jwt", "Bearer " + expired,
                "Bearer " + foreign, "Basic dXNlcjpwYXNz", valid).toList()) {
            SecurityContextHolder.clearContext();

            var chain = run(header);

            assertNull(SecurityContextHolder.getContext().getAuthentication(), "Authorization: " + header);
            assertNotNull(chain.getRequest(), "chain must continue for Authorization: " + header);
        }
    }
}
