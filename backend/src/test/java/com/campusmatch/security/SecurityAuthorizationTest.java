package com.campusmatch.security;

import com.campusmatch.config.SecurityConfig;
import com.campusmatch.controller.HealthController;
import com.campusmatch.controller.UserController;
import com.campusmatch.entity.User;
import com.campusmatch.repository.UserRepository;
import com.campusmatch.service.GroupService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Exercises the real {@link SecurityConfig} authorization rules together with the JWT filter
 * (no database: repositories and services behind the two loaded controllers are mocked).
 */
@WebMvcTest(controllers = {HealthController.class, UserController.class})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtTokenProvider.class})
@TestPropertySource(properties = "jwt.secret=" + SecurityAuthorizationTest.SECRET)
class SecurityAuthorizationTest {

    // Must be a compile-time constant: it is used inside the @TestPropertySource annotation above.
    static final String SECRET = "authorization-test-secret-0123456789-authorization-test-secret-0123456789";
    private static final long ONE_DAY_MS = 86_400_000L;

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private GroupService groupService;

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    @Test
    void publicEndpointNeedsNoToken() throws Exception {
        mvc.perform(get("/api/health")).andExpect(status().isOk());
    }

    @Test
    void protectedEndpointWithoutTokenIsUnauthorized() throws Exception {
        mvc.perform(get("/api/users/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointWithValidTokenIsServedForThatStudent() throws Exception {
        when(userRepository.findByStudentId("20260020")).thenReturn(Optional.of(
                User.builder().studentId("20260020").name("Test Student").role("ROLE_STUDENT").build()));
        String token = tokenProvider.generateToken("20260020", "ROLE_STUDENT", "Test Student");

        mvc.perform(get("/api/users/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentId").value("20260020"));
    }

    @Test
    void protectedEndpointRejectsExpiredForeignAndTamperedTokens() throws Exception {
        String expired = new JwtTokenProvider(SECRET, -1_000L)
                .generateToken("20260020", "ROLE_STUDENT", "Test Student");
        String foreign = new JwtTokenProvider("some-other-secret-".repeat(4), ONE_DAY_MS)
                .generateToken("20260020", "ROLE_STUDENT", "Test Student");

        String[] parts = tokenProvider.generateToken("20260020", "ROLE_STUDENT", "Test Student").split("\\.");
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        String forgedPayload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.replace("ROLE_STUDENT", "ROLE_ADMIN").getBytes(StandardCharsets.UTF_8));
        String tampered = parts[0] + "." + forgedPayload + "." + parts[2];

        for (String token : new String[] {expired, foreign, tampered, "not-a-jwt"}) {
            mvc.perform(get("/api/users/me").header("Authorization", bearer(token)))
                    .andExpect(status().isUnauthorized());
        }
    }
}
