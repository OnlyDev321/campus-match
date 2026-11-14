package com.campusmatch.service;

import com.campusmatch.dto.AuthResponse;
import com.campusmatch.dto.UsaintLoginRequest;
import com.campusmatch.entity.User;
import com.campusmatch.repository.UserRepository;
import com.campusmatch.security.JwtTokenProvider;
import com.campusmatch.security.VerifiedSsoIdentity;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** Service-level guarantees of the SSO login: identity comes only from the verified assertion. */
class AuthServiceTest {

    private static final String VERIFIED = "20260001";
    private static final String OTHER = "20269999";

    private final UserRepository userRepository = mock(UserRepository.class);
    private final JwtTokenProvider tokenProvider =
            new JwtTokenProvider("auth-service-test-secret-0123456789-0123456789", 86_400_000L);
    private final AuthService service = new AuthService(userRepository, tokenProvider);

    private static VerifiedSsoIdentity identity(String studentId) {
        return new VerifiedSsoIdentity(studentId, "assertion-id", Instant.now().plusSeconds(30));
    }

    private static UsaintLoginRequest request(String studentId) {
        return new UsaintLoginRequest(studentId, "Test Student", "소프트웨어학부", "IT대학",
                studentId + "@soongsil.ac.kr", "3", "010-1234-5678", null);
    }

    @Test
    void mismatchingBodyStudentIdIsRejectedBeforeAnyRepositoryAccess() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> service.processUsaintLogin(identity(VERIFIED), request(OTHER)));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verifyNoInteractions(userRepository);
    }

    @Test
    void nullOrBlankBodyStudentIdIsRejectedToo() {
        assertThrows(ResponseStatusException.class, () -> service.processUsaintLogin(identity(VERIFIED), request(null)));
        assertThrows(ResponseStatusException.class, () -> service.processUsaintLogin(identity(VERIFIED), request("")));
        verifyNoInteractions(userRepository);
    }

    @Test
    void existingStudentIsLookedUpByTheVerifiedIdAndTheirProfileIsSynced() {
        User existing = User.builder().studentId(VERIFIED).name("Test Student").email("old@soongsil.ac.kr")
                .role("ROLE_STUDENT").build();
        when(userRepository.findByStudentId(VERIFIED)).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = service.processUsaintLogin(identity(VERIFIED), request(VERIFIED));

        assertEquals(VERIFIED + "@soongsil.ac.kr", existing.getEmail());
        assertEquals("010-1234-5678", existing.getPhoneNumber());
        assertNotNull(existing.getLastLoginAt());
        verify(userRepository).findByStudentId(VERIFIED);
        verify(userRepository, never()).findByStudentId(OTHER);
        assertTrue(response.isSuccess());
        assertEquals(VERIFIED, response.getUser().getStudentId());
    }

    @Test
    void issuedJwtKeepsTheExistingFormatAndNamesTheVerifiedStudent() {
        when(userRepository.findByStudentId(VERIFIED)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = service.processUsaintLogin(identity(VERIFIED), request(VERIFIED));

        Claims claims = tokenProvider.getClaimsFromToken(response.getToken());
        assertEquals(Set.of("sub", "role", "name", "iat", "exp"), claims.keySet());
        assertEquals(VERIFIED, claims.getSubject());
        assertEquals("ROLE_STUDENT", claims.get("role", String.class));
        assertEquals("Bearer", response.getTokenType());
        assertEquals(Long.valueOf(86_400_000L), response.getExpiresIn());
    }

    @Test
    void newAccountsAreAlwaysPlainStudentsWithTheVerifiedStudentId() {
        when(userRepository.findByStudentId(VERIFIED)).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.processUsaintLogin(identity(VERIFIED), request(VERIFIED));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
        assertEquals(VERIFIED, saved.getValue().getStudentId());
        assertEquals("ROLE_STUDENT", saved.getValue().getRole());
    }
}
