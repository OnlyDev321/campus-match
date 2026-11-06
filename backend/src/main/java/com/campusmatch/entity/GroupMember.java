package com.campusmatch.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMember {

    @EmbeddedId
    private GroupMemberId id;

    // Liên kết tới StudyGroup
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("groupId")
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    // Liên kết tới User (Thành viên nhóm)
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Vai trò trong nhóm (LEADER hoặc MEMBER)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private GroupRole role = GroupRole.MEMBER;

    // Thời điểm gia nhập nhóm
    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    /**
     * Helper constructor tiện lợi để tạo nhanh một GroupMember từ StudyGroup và
     * User
     */
    public GroupMember(StudyGroup group, User user, GroupRole role) {
        this.group = group;
        this.user = user;
        this.role = role;
        this.id = new GroupMemberId(group.getId(), user.getId());
    }
}