package com.campusmatch.service;

import com.campusmatch.dto.NotificationResponse;
import com.campusmatch.entity.*;
import com.campusmatch.repository.NotificationRepository;
import com.campusmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String studentId) {
        User user = getUserByStudentId(studentId);
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String studentId) {
        User user = getUserByStudentId(studentId);
        return notificationRepository.countByRecipientAndIsReadFalse(user);
    }

    @Transactional
    public void markAsRead(Long id, String studentId) {
        User user = getUserByStudentId(studentId);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền thao tác trên thông báo này");
        }
        notification.setRead(true);
    }

    @Transactional
    public void markAllAsRead(String studentId) {
        User user = getUserByStudentId(studentId);
        notificationRepository.markAllAsRead(user);
    }

    @Transactional
    public void deleteNotification(Long id, String studentId) {
        User user = getUserByStudentId(studentId);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xóa thông báo này");
        }
        notificationRepository.delete(notification);
    }

    @Transactional
    public void clearAllNotifications(String studentId) {
        User user = getUserByStudentId(studentId);
        notificationRepository.deleteByRecipient(user);
    }

    @Transactional
    public void createNotification(User recipient, User actor, NotificationType type, String title, String message, String link, StudyGroup group) {
        if (recipient == null) {
            log.warn("Không thể tạo thông báo vì recipient là null");
            return;
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .title(title)
                .message(message)
                .link(link)
                .group(group)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.info("Đã tạo thông báo type={} cho sinh viên MSSV: {}", type, recipient.getStudentId());
    }

    private User getUserByStudentId(String studentId) {
        return userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy hồ sơ người dùng"));
    }
}

