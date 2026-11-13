package com.campusmatch.dto;

import com.campusmatch.entity.Notification;
import com.campusmatch.entity.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private String id;
    private NotificationType type;
    private String title;
    private String message;
    private String link;
    private Long groupId;
    private String groupTitle;
    private String actorName;
    private boolean isRead;
    private LocalDateTime createdAt;

    public static NotificationResponse fromEntity(Notification entity) {
        return NotificationResponse.builder()
                .id(String.valueOf(entity.getId()))
                .type(entity.getType())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .link(entity.getLink())
                .groupId(entity.getGroup() != null ? entity.getGroup().getId() : null)
                .groupTitle(entity.getGroup() != null ? entity.getGroup().getTitle() : null)
                .actorName(entity.getActor() != null ? entity.getActor().getName() : null)
                .isRead(entity.isRead())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

