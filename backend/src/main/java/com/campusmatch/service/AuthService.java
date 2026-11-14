package com.campusmatch.service;

import com.campusmatch.dto.AuthResponse;
import com.campusmatch.dto.UsaintLoginRequest;
import com.campusmatch.entity.User;
import com.campusmatch.repository.UserRepository;
import com.campusmatch.security.JwtTokenProvider;
import com.campusmatch.security.StudentIdPrivacy;
import com.campusmatch.security.VerifiedSsoIdentity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Signs a student in from the profile the BFF handed over.
     *
     * @param identity the student identity vouched for by a verified BFF assertion: the ONLY source of the
     *                 student ID. Taking it as a parameter means this method cannot be reached without one.
     * @param request  profile data from the BFF; its {@code studentId} must equal the verified one
     * @throws ResponseStatusException 403 (before any database access) if the body names a different student
     */
    @Transactional
    public AuthResponse processUsaintLogin(VerifiedSsoIdentity identity, UsaintLoginRequest request) {
        String studentId = identity.studentId();
        if (!studentId.equals(request.getStudentId())) {
            log.warn("Rejected SSO login: request studentId does not match the verified assertion subject");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Student identity mismatch");
        }
        // Student IDs are personal data: only the masked form is logged.
        String loggedId = StudentIdPrivacy.publicStudentId(studentId);
        log.info("Xử lý xác thực SSO cho sinh viên MSSV: {}", loggedId);

        // 1. Kiểm tra sinh viên trong Database (theo MSSV đã được xác minh, không phải MSSV trong body)
        User user = userRepository.findByStudentId(studentId)
                .map(existingUser -> {
                    // ĐÃ TỒN TẠI: Cập nhật thông tin email/phoneNumber nếu có thay đổi và cập nhật thời gian đăng nhập
                    log.info("Sinh viên {} đã tồn tại. Cập nhật thông tin hồ sơ từ SSO.", loggedId);
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
                    if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
                        existingUser.setAvatarUrl(request.getAvatarUrl().trim());
                    }
                    existingUser.setLastLoginAt(LocalDateTime.now());
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    // CHƯA TỒN TẠI: Tạo mới hồ sơ sinh viên lần đầu
                    log.info("Tạo mới tài khoản sinh viên: {}", loggedId);
                    User newUser = User.builder()
                            .studentId(studentId)
                            .name(request.getName())
                            .department(request.getDepartment())
                            .faculty(request.getFaculty())
                            .email(request.getEmail())
                            .academicYear(request.getAcademicYear())
                            .phoneNumber(request.getPhoneNumber())
                            .avatarUrl(request.getAvatarUrl())
                            .role("ROLE_STUDENT")
                            .lastLoginAt(LocalDateTime.now())
                            .build();
                    return userRepository.save(newUser);
                });

        // 2. Ký tạo mã JWT Token
        String token = jwtTokenProvider.generateToken(user.getStudentId(), user.getRole(), user.getName());

        // 3. Đóng gói kết quả trả về
        return AuthResponse.builder()
                .success(true)
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationMs())
                .user(AuthResponse.UserSummary.builder()
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
                        .build())
                .build();
    }
}
