package com.campusmatch.service;

import com.campusmatch.dto.UpdateGroupRequest;
import com.campusmatch.entity.GroupRoleQuota;
import com.campusmatch.entity.GroupStatus;
import com.campusmatch.entity.StudyGroup;
import com.campusmatch.entity.User;
import com.campusmatch.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GroupServiceUpdateTest {
    private final GroupRepository groups = mock(GroupRepository.class);
    private final GroupMemberRepository members = mock(GroupMemberRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final GroupService service = new GroupService(groups, members, users,
            mock(ApplicationRepository.class), mock(NotificationRepository.class), mock(NotificationService.class));

    private UpdateGroupRequest request(int capacity) {
        var request = new UpdateGroupRequest();
        request.setTitle("Updated title");
        request.setDescription("Updated description");
        request.setMaxMembers(capacity);
        return request;
    }

    private StudyGroup group(long leaderId, int capacity, GroupStatus status) {
        var leader = User.builder().id(leaderId).studentId("20260020").build();
        return StudyGroup.builder().id(10L).leader(leader).title("Old title")
                .description("Old description").maxMembers(capacity).status(status)
                .rolesQuota(new ArrayList<>(List.of(GroupRoleQuota.builder()
                        .role("Developer").current(2).max(capacity).build())))
                .build();
    }

    @Test
    void increasingCapacityReopensRecruitmentAndAddsRoleSeats() {
        var group = group(1L, 2, GroupStatus.COMPLETED);
        when(users.findByStudentId("20260020")).thenReturn(Optional.of(group.getLeader()));
        when(groups.findById(10L)).thenReturn(Optional.of(group));
        when(groups.save(group)).thenReturn(group);
        when(members.countByGroupId(10L)).thenReturn(2L);

        var result = service.updateGroup(10L, request(4), "20260020");

        assertEquals(GroupStatus.RECRUITING, result.getStatus());
        assertEquals(4, result.getMaxMembers());
        assertEquals(4, result.getRolesQuota().get(0).getMax());
        assertEquals("Updated title", result.getTitle());
        assertEquals("Updated description", result.getDescription());
    }

    @Test
    void capacityEqualToMembersMarksGroupCompleted() {
        var group = group(1L, 4, GroupStatus.RECRUITING);
        when(users.findByStudentId("20260020")).thenReturn(Optional.of(group.getLeader()));
        when(groups.findById(10L)).thenReturn(Optional.of(group));
        when(groups.save(group)).thenReturn(group);
        when(members.countByGroupId(10L)).thenReturn(2L);

        var result = service.updateGroup(10L, request(2), "20260020");

        assertEquals(GroupStatus.COMPLETED, result.getStatus());
        assertEquals(2, result.getRolesQuota().get(0).getMax());
    }

    @Test
    void nonLeaderCannotUpdateGroup() {
        var group = group(1L, 4, GroupStatus.RECRUITING);
        when(users.findByStudentId("20260021")).thenReturn(Optional.of(User.builder().id(2L).build()));
        when(groups.findById(10L)).thenReturn(Optional.of(group));

        assertThrows(ResponseStatusException.class, () -> service.updateGroup(10L, request(5), "20260021"));
        verify(groups, never()).save(any());
    }

    @Test
    void updatesCreateGroupFieldsAndPreservesOccupiedRoleCount() {
        var group = group(1L, 4, GroupStatus.RECRUITING);
        var request = request(5);
        request.setCourseCode("CS490");
        request.setCourseName("Capstone Design");
        request.setMeetingFormat("Online");
        request.setTags(List.of("React", "Spring"));
        request.setContactEmail("team@example.com");
        request.setContactPhone("+82 10 1234 5678");
        request.setRolesQuota(List.of(GroupRoleQuota.builder()
                .role("Frontend Developer").description("Build UI").current(999).max(5).build()));
        when(users.findByStudentId("20260020")).thenReturn(Optional.of(group.getLeader()));
        when(groups.findById(10L)).thenReturn(Optional.of(group));
        when(groups.save(group)).thenReturn(group);
        when(members.countByGroupId(10L)).thenReturn(2L);

        var result = service.updateGroup(10L, request, "20260020");

        assertEquals("CS490", result.getCourseCode());
        assertEquals("Capstone Design", result.getCourseName());
        assertEquals("Online", result.getMeetingFormat());
        assertEquals(List.of("React", "Spring"), result.getTags());
        assertEquals("team@example.com", result.getContactEmail());
        assertEquals("+82 10 1234 5678", result.getContactPhone());
        assertEquals("Frontend Developer", result.getRolesQuota().get(0).getRole());
        assertEquals(2, result.getRolesQuota().get(0).getCurrent());
        assertEquals(5, result.getRolesQuota().get(0).getMax());
    }

    @Test
    void rejectsRoleQuotaBelowOccupiedSeats() {
        var group = group(1L, 4, GroupStatus.RECRUITING);
        var request = request(4);
        request.setRolesQuota(List.of(GroupRoleQuota.builder().role("Developer").current(0).max(1).build(),
                GroupRoleQuota.builder().role("Designer").current(0).max(3).build()));
        when(users.findByStudentId("20260020")).thenReturn(Optional.of(group.getLeader()));
        when(groups.findById(10L)).thenReturn(Optional.of(group));
        when(members.countByGroupId(10L)).thenReturn(2L);

        assertThrows(ResponseStatusException.class, () -> service.updateGroup(10L, request, "20260020"));
        verify(groups, never()).save(any());
    }
}
