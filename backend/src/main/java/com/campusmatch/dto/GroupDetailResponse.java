package com.campusmatch.dto;

import com.campusmatch.entity.GroupStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import com.campusmatch.entity.GroupRoleQuota;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDetailResponse {
    private Long id;
    private String title;
    private String description;
    private String college;
    private String department;
    private Integer postYear;
    private String courseCode;
    private String courseName;
    private String meetingFormat;
    private List<String> tags;
    private String contactEmail;
    private String contactPhone;
    private Integer maxMembers;
    private Long memberCount;
    private GroupStatus status;
    private List<GroupRoleQuota> rolesQuota;
    private AuthResponse.UserSummary leader;
    private List<GroupMemberSummaryResponse> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

