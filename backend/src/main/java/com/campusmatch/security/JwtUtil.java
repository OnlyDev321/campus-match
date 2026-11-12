package com.campusmatch.security;

import org.springframework.stereotype.Component;

/**
 * Lớp tiện ích JwtUtil ủy quyền sang JwtTokenProvider.
 * Đảm bảo tương thích với các component đã inject JwtUtil trước đó.
 */
@Component
public class JwtUtil {

    private final JwtTokenProvider tokenProvider;

    public JwtUtil(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    public String generateToken(String studentId, String role, String name) {
        return tokenProvider.generateToken(studentId, role, name);
    }

    public String getStudentIdFromToken(String token) {
        return tokenProvider.getStudentIdFromToken(token);
    }

    public boolean validateToken(String token) {
        return tokenProvider.validateToken(token);
    }

    public long getExpirationMs() {
        return tokenProvider.getExpirationMs();
    }
}
