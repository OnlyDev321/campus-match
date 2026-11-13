package com.campusmatch.controller;

import com.campusmatch.dto.NotificationResponse;
import com.campusmatch.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Lấy toàn bộ thông báo của người dùng hiện tại
     * GET /api/notifications
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(Authentication authentication) {
        String studentId = getAuthenticatedStudentId(authentication);
        return ResponseEntity.ok(notificationService.getMyNotifications(studentId));
    }

    /**
     * Lấy số lượng thông báo chưa đọc
     * GET /api/notifications/unread-count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        String studentId = getAuthenticatedStudentId(authentication);
        long count = notificationService.getUnreadCount(studentId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    /**
     * Đánh dấu 1 thông báo là đã đọc
     * PATCH /api/notifications/{id}/read
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        String studentId = getAuthenticatedStudentId(authentication);
        notificationService.markAsRead(id, studentId);
        return ResponseEntity.ok().build();
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     * PATCH /api/notifications/read-all
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        String studentId = getAuthenticatedStudentId(authentication);
        notificationService.markAllAsRead(studentId);
        return ResponseEntity.ok().build();
    }

    /**
     * Xóa 1 thông báo
     * DELETE /api/notifications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, Authentication authentication) {
        String studentId = getAuthenticatedStudentId(authentication);
        notificationService.deleteNotification(id, studentId);
        return ResponseEntity.ok().build();
    }

    /**
     * Xóa toàn bộ thông báo
     * DELETE /api/notifications
     */
    @DeleteMapping
    public ResponseEntity<Void> clearAll(Authentication authentication) {
        String studentId = getAuthenticatedStudentId(authentication);
        notificationService.clearAllNotifications(studentId);
        return ResponseEntity.ok().build();
    }

    private String getAuthenticatedStudentId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để thực hiện hành động này");
        }
        return authentication.getName();
    }
}

