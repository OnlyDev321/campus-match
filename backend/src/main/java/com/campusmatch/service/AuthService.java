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
                    // ĐÃ TỒN TẠI: TUYỆT ĐỐI KHÔNG THAY ĐỔI THÔNG TIN DANH TÍNH CỦA USER
                    log.info("Sinh viên {} đã tồn tại. Giữ nguyên thông tin hồ sơ gốc.", existingUser.getStudentId());
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
                        .role(user.getRole())
                        .build())
                .build();
    }
}
