package com.campusmatch.controller;

import com.campusmatch.dto.AuthResponse;
import com.campusmatch.dto.UsaintLoginRequest;
import com.campusmatch.security.SsoBridgeAuthentication;
import com.campusmatch.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Receives the profile the Next.js BFF hands over after it has verified the student's u-SAINT login.
     * POST /api/auth/sso/usaint
     *
     * <p>Only reachable with a valid signed BFF assertion (see SsoBridgeSecurityConfig). The student this
     * login is for comes from that verified assertion; the body's {@code studentId} must agree with it.
     */
    @PostMapping("/sso/usaint")
    public ResponseEntity<AuthResponse> ssoLogin(
            Authentication authentication,
            @Valid @RequestBody UsaintLoginRequest request) {
        // Defence in depth: the filter chain already enforces this, but identity must never come from anywhere else.
        if (!(authentication instanceof SsoBridgeAuthentication bridge)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        AuthResponse response = authService.processUsaintLogin(bridge.identity(), request);
        return ResponseEntity.ok(response);
    }
}
