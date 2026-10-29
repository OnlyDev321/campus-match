package com.campusmatch.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private boolean success;
    private String token; // Chuỗi JWT Bearer Token
    private String tokenType; // "Bearer"
    private Long expiresIn; // Thời hạn token (miliseconds)
    private UserSummary user; // Thông tin tóm tắt của sinh viên

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private Long id;
        private String studentId;
        private String name;
        private String department;
        private String faculty;
        private String email;
        private String academicYear;
        private String phoneNumber;
        private String role;
    }
}
