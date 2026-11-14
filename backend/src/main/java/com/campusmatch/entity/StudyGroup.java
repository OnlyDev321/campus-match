package com.campusmatch.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "study_groups", indexes = {
        @Index(name = "idx_study_groups_filter", columnList = "college, department, post_year")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Trưởng nhóm (Leader) tạo nhóm
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_id", nullable = false)
    private User leader;

    // Tiêu đề bài đăng tuyển nhóm
    @Column(nullable = false, length = 150)
    private String title;

    // Mô tả chi tiết yêu cầu, mục tiêu nhóm
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    // --- 3 TRƯỜNG PHÂN LOẠI U-SAINT ---
    // 1. Đơn vị trường/viện (단과대학, VD: IT대학)
    @Column(nullable = false, length = 100)
    private String college;

    // 2. Đơn vị khoa/ngành (학부/학과, VD: 소프트웨어학부)
    @Column(nullable = false, length = 100)
    private String department;

    // 3. Năm đăng bài (VD: 2024, 2025, 2026...) để đánh Index lọc siêu tốc
    @Column(name = "post_year", nullable = false)
    private Integer postYear;

    // Mã môn học & Tên môn học (tùy chọn, VD: CS490 - Capstone Design)
    @Column(name = "course_code", length = 50)
    private String courseCode;

    @Column(name = "course_name", length = 100)
    private String courseName;

    // Chỉ lưu thông tin liên hệ mà leader đã chọn công khai cho nhóm này.
    @Column(name = "contact_email", length = 254)
    private String contactEmail;

    @Column(name = "contact_phone", length = 25)
    private String contactPhone;

    // Số lượng thành viên tối đa
    @Column(name = "max_members", nullable = false)
    private Integer maxMembers;

    @ElementCollection
    @CollectionTable(name = "group_role_quotas", joinColumns = @JoinColumn(name = "group_id"))
    @OrderColumn(name = "position")
    @Builder.Default
    private List<GroupRoleQuota> rolesQuota = new ArrayList<>();

    // Trạng thái nhóm (RECRUITING, COMPLETED, CLOSED)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private GroupStatus status = GroupStatus.RECRUITING;

    // Thời gian tạo bài đăng
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Thời gian cập nhật bài đăng lần cuối
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Tự động gán postYear theo năm hiện tại nếu lúc tạo chưa set
    @PrePersist
    public void prePersist() {
        if (this.postYear == null) {
            this.postYear = LocalDate.now().getYear();
        }
    }
}
