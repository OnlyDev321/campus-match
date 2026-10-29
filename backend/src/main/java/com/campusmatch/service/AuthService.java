package com.campusmatch.service;

import com.campusmatch.dto.AuthResponse;
import com.campusmatch.dto.UsaintLoginRequest;
import com.campusmatch.entity.User;
import com.campusmatch.repository.UserRepository;
import com.campusmatch.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse processUsaintLogin(UsaintLoginRequest request) {
        log.info("Xử lý xác thực SSO cho sinh viên MSSV: {}", request.getStudentId());

        // 1. Kiểm tra sinh viên trong Database
        User user = userRepository.findByStudentId(request.getStudentId())
                .map(existingUser -> {
                    // ĐÃ TỒN TẠI: Cập nhật thông tin email/phoneNumber nếu có thay đổi và cập nhật thời gian đăng nhập
                    log.info("Sinh viên {} đã tồn tại. Cập nhật thông tin hồ sơ từ SSO.", existingUser.getStudentId());
                    if (request.getEmail() != null && !request.getEmail().isBlank()) {
                        existingUser.setEmail(request.getEmail().trim());
                    }
                    if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
                        existingUser.setPhoneNumber(request.getPhoneNumber().trim());
                    }
                    if (request.getName() != null && !request.getName().isBlank()) {
                        existingUser.setName(request.getName().trim());
                    }
                    if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
                        existingUser.setDepartment(request.getDepartment().trim());
                    }
                    if (request.getFaculty() != null && !request.getFaculty().isBlank()) {
                        existingUser.setFaculty(request.getFaculty().trim());
                    }
                    if (request.getAcademicYear() != null && !request.getAcademicYear().isBlank()) {
                        existingUser.setAcademicYear(request.getAcademicYear().trim());
                    }
                    existingUser.setLastLoginAt(LocalDateTime.now());
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    // CHƯA TỒN TẠI: Tạo mới hồ sơ sinh viên lần đầu
                    log.info("Tạo mới tài khoản sinh viên: {}", request.getStudentId());
                    User newUser = User.builder()
                            .studentId(request.getStudentId())
                            .name(request.getName())
                            .department(request.getDepartment())
                            .faculty(request.getFaculty())
                            .email(request.getEmail())
                            .academicYear(request.getAcademicYear())
                            .phoneNumber(request.getPhoneNumber())
                            .role("ROLE_STUDENT")
                            .lastLoginAt(LocalDateTime.now())
                            .build();
                    return userRepository.save(newUser);
                });

        // 2. Ký tạo mã JWT Token
        String token = jwtUtil.generateToken(user.getStudentId(), user.getRole(), user.getName());

        // 3. Đóng gói kết quả trả về
        return AuthResponse.builder()
                .success(true)
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpirationMs())
                .user(AuthResponse.UserSummary.builder()
                        .id(user.getId())
                        .studentId(user.getStudentId())
                        .name(user.getName())
                        .department(user.getDepartment())
                        .faculty(user.getFaculty())
                        .email(user.getEmail())
                        .academicYear(user.getAcademicYear())
                        .phoneNumber(user.getPhoneNumber())
                        .role(user.getRole())
                        .build())
                .build();
    }
}
