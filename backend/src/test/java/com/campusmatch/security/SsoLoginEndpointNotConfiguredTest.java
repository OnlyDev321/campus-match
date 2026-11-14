package com.campusmatch.security;

import com.campusmatch.config.SecurityConfig;
import com.campusmatch.config.SsoBridgeSecurityConfig;
import com.campusmatch.controller.AuthController;
import com.campusmatch.repository.UserRepository;
import com.campusmatch.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;

import static com.campusmatch.security.SsoTestAssertions.assertion;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Fail closed: with SSO_ASSERTION_SECRET unset the application still starts, but the endpoint trusts nobody. */
@WebMvcTest(controllers = AuthController.class)
@Import({SecurityConfig.class, SsoBridgeSecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class,
        AuthService.class, SsoAssertionVerifier.class, SsoAssertionReplayGuard.class})
@TestPropertySource(properties = {
        "jwt.secret=" + SsoLoginEndpointNotConfiguredTest.JWT_SECRET,
        "sso.assertion.secret="})
class SsoLoginEndpointNotConfiguredTest {

    static final String JWT_SECRET = "unconfigured-test-application-jwt-secret-0123456789";

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    void everyRequestIsRejectedEvenWithAnAssertionSignedByTheKnownTestKey() throws Exception {
        String body = "{\"studentId\":\"20260001\",\"name\":\"Test Student\"}";

        mvc.perform(post("/api/auth/sso/usaint")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body.getBytes(StandardCharsets.UTF_8))
                        .header("X-SSO-Assertion", assertion().subject("20260001").body(body).build()))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/auth/sso/usaint")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body.getBytes(StandardCharsets.UTF_8)))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(userRepository);
    }
}
