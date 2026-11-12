package com.campusmatch.dto;

import com.campusmatch.entity.GroupStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyGroupSummaryResponse {
    private Long id;
    private String title;
    private String description;
    private String courseCode;
    private String courseName;
    private String college;
    private String department;
    private GroupStatus status;
    private Integer maxMembers;
    private Long memberCount;
    private String myRole; // "LEADER" or "MEMBER"
    private AuthResponse.UserSummary leader;
    private List<GroupMemberSummaryResponse> members;
    private Long pendingApplicationCount;
    private LocalDateTime createdAt;
}

