package com.campusmatch.security;

import com.campusmatch.config.SecurityConfig;
import com.campusmatch.config.SsoBridgeSecurityConfig;
import com.campusmatch.controller.AuthController;
import com.campusmatch.controller.HealthController;
import com.campusmatch.controller.UserController;
import com.campusmatch.entity.User;
import com.campusmatch.repository.UserRepository;
import com.campusmatch.service.AuthService;
import com.campusmatch.service.GroupService;
import com.jayway.jsonpath.JsonPath;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;

import static com.campusmatch.security.SsoTestAssertions.SECRET;
import static com.campusmatch.security.SsoTestAssertions.assertion;
import static com.campusmatch.security.SsoTestAssertions.b64;
import static com.campusmatch.security.SsoTestAssertions.unb64;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Drives POST /api/auth/sso/usaint through the REAL Spring Security filter chains (student chain and the SSO bridge
 * chain), the real filter, verifier, replay guard, controller, AuthService and JwtTokenProvider. Only the repository
 * is mocked, so every test can state exactly what was (and was not) read or written.
 *
 * <p>Mocked verification: no database and no real u-SAINT. The BFF side is covered by the wire-compatibility vector in
 * {@link SsoAssertionVerifierTest}.
 */
@WebMvcTest(controllers = {AuthController.class, UserController.class, HealthController.class})
@Import({SecurityConfig.class, SsoBridgeSecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        AuthService.class, SsoAssertionVerifier.class, SsoAssertionReplayGuard.class})
@TestPropertySource(properties = {
        "jwt.secret=" + SsoLoginEndpointTest.JWT_SECRET,
        "sso.assertion.secret=" + SsoTestAssertions.SECRET})
class SsoLoginEndpointTest {

    static final String JWT_SECRET = "endpoint-test-application-jwt-secret-0123456789-abcdef";
    private static final String LOGIN = "/api/auth/sso/usaint";
    private static final String VICTIM = "20260001";
    private static final String OTHER = "20269999";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private GroupService groupService;

    private static String body(String studentId, String email) {
        return "{\"studentId\":\"" + studentId + "\",\"name\":\"김하늘\",\"department\":\"소프트웨어학부\","
                + "\"faculty\":\"IT대학\",\"academicYear\":\"3\",\"email\":\"" + email + "\"}";
    }

    private static MockHttpServletRequestBuilder login(String assertion, String body) {
        MockHttpServletRequestBuilder request = post(LOGIN)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body.getBytes(StandardCharsets.UTF_8));
        return assertion == null ? request : request.header(SsoAssertionAuthenticationFilter.ASSERTION_HEADER, assertion);
    }

    private static String validAssertionFor(String studentId, String body) {
        return assertion().subject(studentId).body(body).build();
    }

    private User existingStudent(String studentId, String email) {
        User user = User.builder().studentId(studentId).name("Original Name").email(email).role("ROLE_STUDENT").build();
        when(userRepository.findByStudentId(studentId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        return user;
    }

    private void assertNothingTouchedAndNoTokenIssued(MvcResult result) throws Exception {
        verifyNoInteractions(userRepository);
        assertFalse(result.getResponse().getContentAsString().contains("token"), "a rejected request must not yield a JWT");
    }

    // ---------------------------------------------------------------- accepted

    @Test
    void validAssertionIssuesAJwtForTheVerifiedStudentAndUpdatesOnlyThatProfile() throws Exception {
        User student = existingStudent(VICTIM, "old@soongsil.ac.kr");
        String body = body(VICTIM, "new@soongsil.ac.kr");

        MvcResult result = mvc.perform(login(validAssertionFor(VICTIM, body), body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.studentId").value(VICTIM))
                .andReturn();

        // legitimate profile sync still works for the verified student
        assertEquals("new@soongsil.ac.kr", student.getEmail());
        verify(userRepository).findByStudentId(VICTIM);
        verify(userRepository, times(1)).save(student);

        // JWT format is unchanged: same claim set, subject is the verified student
        String token = JsonPath.read(result.getResponse().getContentAsString(), "$.token");
        Claims claims = tokenProvider.getClaimsFromToken(token);
        assertEquals(Set.of("sub", "role", "name", "iat", "exp"), claims.keySet());
        assertEquals(VICTIM, claims.getSubject());
        assertEquals("ROLE_STUDENT", claims.get("role", String.class));

        // ...and that JWT works against a protected API (login -> authenticated call)
        mvc.perform(get("/api/users/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value(VICTIM));
    }

    @Test
    void firstLoginCreatesAStudentAccountForTheVerifiedStudentId() throws Exception {
        when(userRepository.findByStudentId(VICTIM)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        String body = body(VICTIM, "20260001@soongsil.ac.kr");

        mvc.perform(login(validAssertionFor(VICTIM, body), body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.role").value("ROLE_STUDENT"));

        var created = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(created.capture());
        assertEquals(VICTIM, created.getValue().getStudentId());
        assertEquals("ROLE_STUDENT", created.getValue().getRole());
    }

    // ---------------------------------------------------------------- the original attack

    @Test
    void anonymousCallerCannotGetAJwtForAnotherStudentOrOverwriteTheirProfile() throws Exception {
        // This is exactly the pre-fix exploit (see the original audit): no credentials at all.
        User victim = existingStudent(VICTIM, "victim@soongsil.ac.kr");

        MvcResult result = mvc.perform(login(null, body(VICTIM, "attacker@evil.example")))
                .andExpect(status().isUnauthorized())
                .andReturn();

        assertNothingTouchedAndNoTokenIssued(result);
        assertEquals("victim@soongsil.ac.kr", victim.getEmail(), "profile must be unchanged");
        verify(userRepository, never()).save(any());
    }

    @Test
    void missingAssertionIsRejected() throws Exception {
        assertNothingTouchedAndNoTokenIssued(
                mvc.perform(login(null, body(VICTIM, "a@b.c"))).andExpect(status().isUnauthorized()).andReturn());
    }

    @Test
    void blankAssertionIsRejected() throws Exception {
        assertNothingTouchedAndNoTokenIssued(
                mvc.perform(login("   ", body(VICTIM, "a@b.c"))).andExpect(status().isUnauthorized()).andReturn());
    }

    @Test
    void invalidSignatureIsRejected() throws Exception {
        String body = body(VICTIM, "a@b.c");
        String forged = assertion().subject(VICTIM).body(body).secret("an-attacker-guess-0123456789-0123456789-xyz").build();

        assertNothingTouchedAndNoTokenIssued(
                mvc.perform(login(forged, body)).andExpect(status().isUnauthorized()).andReturn());
    }

    @Test
    void alteredAssertionPayloadIsRejected() throws Exception {
        String body = body(VICTIM, "a@b.c");
        String[] parts = validAssertionFor(OTHER, body).split("\\.");
        String swappedSubject = b64(unb64(parts[1]).replace(OTHER, VICTIM)); // attacker retargets a captured assertion

        assertNothingTouchedAndNoTokenIssued(mvc.perform(login(parts[0] + "." + swappedSubject + "." + parts[2], body))
                .andExpect(status().isUnauthorized()).andReturn());
    }

    @Test
    void expiredAssertionIsRejected() throws Exception {
        String body = body(VICTIM, "a@b.c");
        String expired = assertion().subject(VICTIM).body(body).issuedAt(Instant.now().minusSeconds(300)).build();

        assertNothingTouchedAndNoTokenIssued(
                mvc.perform(login(expired, body)).andExpect(status().isUnauthorized()).andReturn());
    }

    @Test
    void assertionWithWrongIssuerOrAudienceIsRejected() throws Exception {
        String body = body(VICTIM, "a@b.c");

        assertNothingTouchedAndNoTokenIssued(mvc.perform(login(
                assertion().subject(VICTIM).body(body).issuer("evil-service").build(), body))
                .andExpect(status().isUnauthorized()).andReturn());
        assertNothingTouchedAndNoTokenIssued(mvc.perform(login(
                assertion().subject(VICTIM).body(body).audience("some-other-backend").build(), body))
                .andExpect(status().isUnauthorized()).andReturn());
    }

    @Test
    void unsignedAlgNoneAssertionIsRejected() throws Exception {
        String body = body(VICTIM, "a@b.c");
        String payload = validAssertionFor(VICTIM, body).split("\\.")[1];

        assertNothingTouchedAndNoTokenIssued(mvc.perform(login(b64("{\"alg\":\"none\"}") + "." + payload + ".", body))
                .andExpect(status().isUnauthorized()).andReturn());
    }

    @Test
    void anApplicationJwtIsNotAnAssertion() throws Exception {
        String body = body(VICTIM, "a@b.c");
        String studentJwt = tokenProvider.generateToken(VICTIM, "ROLE_STUDENT", "Test Student");

        assertNothingTouchedAndNoTokenIssued(
                mvc.perform(login(studentJwt, body)).andExpect(status().isUnauthorized()).andReturn());
    }

    @Test
    void anApplicationJwtInTheAuthorizationHeaderDoesNotAuthenticateTheBridgeEndpoint() throws Exception {
        String studentJwt = tokenProvider.generateToken(VICTIM, "ROLE_STUDENT", "Test Student");

        assertNothingTouchedAndNoTokenIssued(mvc.perform(login(null, body(VICTIM, "a@b.c"))
                        .header("Authorization", "Bearer " + studentJwt))
                .andExpect(status().isUnauthorized()).andReturn());
    }

    @Test
    void severalAssertionHeadersAreAmbiguousAndRejected() throws Exception {
        String body = body(VICTIM, "a@b.c");
        String good = validAssertionFor(VICTIM, body);

        assertNothingTouchedAndNoTokenIssued(mvc.perform(login(good, body)
                        .header(SsoAssertionAuthenticationFilter.ASSERTION_HEADER, good))
                .andExpect(status().isUnauthorized()).andReturn());
    }

    // ---------------------------------------------------------------- forged / mismatched identity

    @Test
    void bodyNamingAnotherStudentThanTheVerifiedOneIsRejectedBeforeAnyDatabaseAccess() throws Exception {
        // Valid assertion for OTHER, but the body asks to log in / overwrite VICTIM.
        String forgedBody = body(VICTIM, "attacker@evil.example");

        MvcResult result = mvc.perform(login(validAssertionFor(OTHER, forgedBody), forgedBody))
                .andExpect(status().isForbidden())
                .andReturn();

        assertNothingTouchedAndNoTokenIssued(result);
    }

    @Test
    void studentIdComparisonIsExact() throws Exception {
        for (String variant : new String[] {VICTIM + " ", " " + VICTIM, VICTIM + "0", "2026000"}) {
            String body = body(variant, "a@b.c");
            mvc.perform(login(validAssertionFor(VICTIM, body), body)).andExpect(status().isForbidden());
        }
        verifyNoInteractions(userRepository);
    }

    @Test
    void oneStudentCannotUpdateAnotherStudentsProfile() throws Exception {
        User victim = existingStudent(VICTIM, "victim@soongsil.ac.kr");
        User attacker = existingStudent(OTHER, "attacker@soongsil.ac.kr");

        // The attacker's own, genuinely valid login only ever touches the attacker's row...
        String own = body(OTHER, "attacker-new@soongsil.ac.kr");
        mvc.perform(login(validAssertionFor(OTHER, own), own)).andExpect(status().isOk());
        // ...and cannot be redirected to the victim's row through the body.
        String redirected = body(VICTIM, "attacker-new@soongsil.ac.kr");
        mvc.perform(login(validAssertionFor(OTHER, redirected), redirected)).andExpect(status().isForbidden());

        assertEquals("attacker-new@soongsil.ac.kr", attacker.getEmail());
        assertEquals("victim@soongsil.ac.kr", victim.getEmail());
        verify(userRepository, never()).findByStudentId(VICTIM);
        verify(userRepository, times(1)).save(attacker);
        verify(userRepository, never()).save(victim);
    }

    @Test
    void aStudentJwtCannotRedirectTheLoginToItsOwnIdentity() throws Exception {
        // A student with a valid JWT sends a (legitimately issued) assertion for someone else: the identity is the
        // assertion's, never the JWT's, and the JWT is not even consulted on this endpoint.
        existingStudent(VICTIM, "victim@soongsil.ac.kr");
        String body = body(VICTIM, "victim@soongsil.ac.kr");
        String otherStudentsJwt = tokenProvider.generateToken(OTHER, "ROLE_STUDENT", "Other");

        MvcResult result = mvc.perform(login(validAssertionFor(VICTIM, body), body)
                        .header("Authorization", "Bearer " + otherStudentsJwt))
                .andExpect(status().isOk())
                .andReturn();

        String token = JsonPath.read(result.getResponse().getContentAsString(), "$.token");
        assertEquals(VICTIM, tokenProvider.getStudentIdFromToken(token));
        verify(userRepository, never()).findByStudentId(OTHER);
    }

    // ---------------------------------------------------------------- body binding and replay

    @Test
    void bodyChangedAfterSigningIsRejected() throws Exception {
        String signedBody = body(VICTIM, "genuine@soongsil.ac.kr");
        String tamperedBody = body(VICTIM, "attacker@evil.example"); // same student, different profile data

        assertNothingTouchedAndNoTokenIssued(mvc.perform(login(validAssertionFor(VICTIM, signedBody), tamperedBody))
                .andExpect(status().isUnauthorized()).andReturn());
    }

    @Test
    void replayedAssertionIsRejected() throws Exception {
        existingStudent(VICTIM, "victim@soongsil.ac.kr");
        String body = body(VICTIM, "victim@soongsil.ac.kr");
        String assertion = validAssertionFor(VICTIM, body);

        mvc.perform(login(assertion, body)).andExpect(status().isOk());
        MvcResult replay = mvc.perform(login(assertion, body)).andExpect(status().isUnauthorized()).andReturn();

        assertFalse(replay.getResponse().getContentAsString().contains("token"));
        verify(userRepository, times(1)).save(any());
    }

    @Test
    void aFreshAssertionForTheSameStudentIsAcceptedAgain() throws Exception {
        existingStudent(VICTIM, "victim@soongsil.ac.kr");
        String body = body(VICTIM, "victim@soongsil.ac.kr");

        mvc.perform(login(validAssertionFor(VICTIM, body), body)).andExpect(status().isOk());
        mvc.perform(login(validAssertionFor(VICTIM, body), body)).andExpect(status().isOk());
    }

    @Test
    void oversizedBodyIsRejectedWithoutTouchingTheDatabase() throws Exception {
        String huge = "{\"studentId\":\"" + VICTIM + "\",\"name\":\"" + "a".repeat(2 * 1024 * 1024) + "\"}";

        MvcResult result = mvc.perform(login(validAssertionFor(VICTIM, huge), huge))
                .andExpect(status().isContentTooLarge())
                .andReturn();

        assertNothingTouchedAndNoTokenIssued(result);
    }

    // ---------------------------------------------------------------- the rest of the surface

    @Test
    void theBridgeEndpointIsNotReachableWithOtherMethods() throws Exception {
        mvc.perform(get(LOGIN)).andExpect(status().isUnauthorized());
        verifyNoInteractions(userRepository);
    }

    @Test
    void otherAuthPathsAreNoLongerPublic() throws Exception {
        mvc.perform(post("/api/auth/anything-else").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/anything-else")).andExpect(status().isUnauthorized());
        verifyNoInteractions(userRepository);
    }

    @Test
    void browsersCannotPreflightTheBridgeEndpointButStillCanForTheStudentApi() throws Exception {
        mvc.perform(options(LOGIN)
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));

        mvc.perform(options("/api/users/me")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
    }

    @Test
    void existingJwtAuthenticationAndAuthorizationAreUnchanged() throws Exception {
        existingStudent(VICTIM, "victim@soongsil.ac.kr");
        String validJwt = tokenProvider.generateToken(VICTIM, "ROLE_STUDENT", "Test Student");
        String forgedJwt = new JwtTokenProvider("some-other-secret-".repeat(4), 86_400_000L)
                .generateToken(VICTIM, "ROLE_STUDENT", "Test Student");

        mvc.perform(get("/api/health")).andExpect(status().isOk());
        mvc.perform(get("/api/users/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me").header("Authorization", "Bearer " + forgedJwt)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/users/me").header("Authorization", "Bearer " + validJwt)).andExpect(status().isOk());
    }
}
