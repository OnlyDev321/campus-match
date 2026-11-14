package com.campusmatch.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mã số sinh viên u-SAINT: Duy nhất, bắt buộc, KHÔNG ĐƯỢC PHÉP SỬA
    @Column(name = "student_id", unique = true, nullable = false, length = 20, updatable = false)
    private String studentId;

    // Họ và tên chính thức, làm mới khi u-SAINT trả thông tin mới.
    @Column(nullable = false, length = 100)
    private String name;

    // Khoa / Ngành học, làm mới khi đăng nhập lại.
    @Column(length = 100)
    private String department;

    // Trường / Viện chủ quản (VD: IT대학), làm mới khi đăng nhập lại.
    @Column(length = 100)
    private String faculty;

    // Email trường cấp (@soongsil.ac.kr)
    @Column(length = 150)
    private String email;

    // Năm học cập nhật từ hồ sơ u-SAINT mỗi lần đăng nhập.
    @Column(name = "academic_year", length = 10)
    private String academicYear;

    // Số điện thoại liên hệ
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    // Ảnh đại diện / ảnh thẻ sinh viên u-SAINT
    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    // Phân quyền mặc định trong hệ thống
    @Column(nullable = false, length = 20)
    @Builder.Default
    private String role = "ROLE_STUDENT";

    // Thời gian tạo tài khoản lần đầu (chỉ ghi nhận 1 lần duy nhất)
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Thời điểm đăng nhập u-SAINT gần nhất
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
}
