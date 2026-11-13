package com.campusmatch.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notifications_recipient", columnList = "recipient_id, is_read, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Sinh viên nhận thông báo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    // Sinh viên tạo hành động (người nộp đơn, người duyệt) - tùy chọn
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    // Loại sự kiện thông báo
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private NotificationType type;

    // Tiêu đề thông báo
    @Column(nullable = false, length = 255)
    private String title;

    // Nội dung chi tiết thông báo
    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    // Đường dẫn khi nhấp vào thông báo (ví dụ: /manage/1, /groups/2)
    @Column(length = 255)
    private String link;

    // Nhóm học tập liên quan
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private StudyGroup group;

    // Trạng thái đã đọc (mặc định false)
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false;

    // Thời gian tạo thông báo
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

