package com.campusmatch.dto;

import com.campusmatch.entity.GroupStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupSummaryResponse {
    private Long id;
    private String title;
    private String description;
    private String college;
    private String department;
    private Integer postYear;
    private String courseCode;
    private String courseName;
    private Integer maxMembers;
    private Long memberCount;
    private GroupStatus status;
    private AuthResponse.UserSummary leader;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

