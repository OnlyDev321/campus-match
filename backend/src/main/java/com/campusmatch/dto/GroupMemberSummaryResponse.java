package com.campusmatch.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMemberSummaryResponse {
    private Long userId;
    private String studentId;
    private String name;
    private String department;
    private String faculty;
    private String avatarUrl;
    private String role; // "LEADER" or "MEMBER"
    private LocalDateTime joinedAt;
}

