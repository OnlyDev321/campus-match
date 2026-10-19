package com.campusmatch.controller;

import com.campusmatch.dto.AuthResponse;
import com.campusmatch.dto.UsaintLoginRequest;
import com.campusmatch.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint nhận dữ liệu bàn giao từ Next.js BFF sau khi xác thực u-SAINT thành
     * công.
     * POST /api/auth/sso/usaint
     */
    @PostMapping("/sso/usaint")
    public ResponseEntity<AuthResponse> ssoLogin(@Valid @RequestBody UsaintLoginRequest request) {
        AuthResponse response = authService.processUsaintLogin(request);
        return ResponseEntity.ok(response);
    }
}
