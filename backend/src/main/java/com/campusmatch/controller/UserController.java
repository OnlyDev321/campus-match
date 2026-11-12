package com.campusmatch.controller;

import com.campusmatch.dto.AuthResponse;
import com.campusmatch.entity.User;
import com.campusmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * Endpoint lấy profile của sinh viên đang đăng nhập dựa trên JWT Bearer token
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse.UserSummary> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa xác thực người dùng");
        }

        String studentId = authentication.getName();
        User user = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin sinh viên"));

        AuthResponse.UserSummary summary = AuthResponse.UserSummary.builder()
                .id(user.getId())
                .studentId(user.getStudentId())
                .name(user.getName())
                .department(user.getDepartment())
                .faculty(user.getFaculty())
                .email(user.getEmail())
                .academicYear(user.getAcademicYear())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .build();

        return ResponseEntity.ok(summary);
    }
}

