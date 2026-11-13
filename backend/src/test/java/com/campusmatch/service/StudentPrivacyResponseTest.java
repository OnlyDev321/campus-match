package com.campusmatch.service;

import com.campusmatch.dto.CreateGroupRequest;
import com.campusmatch.entity.*;
import com.campusmatch.repository.*;
import org.springframework.web.server.ResponseStatusException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StudentPrivacyResponseTest {
    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createGroupRejectsContactEmailContainingFullStudentId() {
        var groups = mock(GroupRepository.class);
        var users = mock(UserRepository.class);
        var service = new GroupService(groups, mock(GroupMemberRepository.class), users,
                mock(ApplicationRepository.class), mock(NotificationRepository.class), mock(NotificationService.class));
        when(users.findByStudentId("20260020")).thenReturn(Optional.of(
                User.builder().id(1L).studentId("20260020").build()));
        var request = CreateGroupRequest.builder().title("Study group").description("A study group")
                .maxMembers(4).contactEmail("20260020@soongsil.ac.kr").build();

        assertThrows(ResponseStatusException.class, () -> service.createGroup(request, "20260020"));
        verifyNoInteractions(groups);
    }

    @Test
    void createGroupReturnsOnlyExplicitGroupContact() {
        var groups = mock(GroupRepository.class);
        var members = mock(GroupMemberRepository.class);
        var users = mock(UserRepository.class);
        var service = new GroupService(groups, members, users,
                mock(ApplicationRepository.class), mock(NotificationRepository.class), mock(NotificationService.class));
        var leader = User.builder().id(1L).studentId("20260020").email("20260020@soongsil.ac.kr")
                .faculty("IT").department("Software").build();
        when(users.findByStudentId("20260020")).thenReturn(Optional.of(leader));
        when(groups.save(any(StudyGroup.class))).thenAnswer(invocation -> {
            StudyGroup group = invocation.getArgument(0);
            group.setId(10L);
            return group;
        });
        when(members.findByGroupId(10L)).thenReturn(List.of());
        var request = CreateGroupRequest.builder().title("Study group").description("A study group")
                .maxMembers(4).contactEmail("leader@example.com").contactPhone("+82 10 1234 5678").build();

        var response = service.createGroup(request, "20260020");
        assertEquals("leader@example.com", response.getContactEmail());
        assertEquals("+82 10 1234 5678", response.getContactPhone());
        assertEquals("****0020", response.getLeader().getStudentId());
        assertNull(response.getLeader().getEmail());
    }

    @Test
    void groupDetailMasksLeaderAndMembersBeforeReturningResponse() {
        var groups = mock(GroupRepository.class);
        var members = mock(GroupMemberRepository.class);
        var service = new GroupService(
                groups,
                members,
                mock(UserRepository.class),
                mock(ApplicationRepository.class),
                mock(NotificationRepository.class),
                mock(NotificationService.class));
        var leader = User.builder().id(1L).studentId("20260020").email("20260020@soongsil.ac.kr").build();
        var member = User.builder().id(2L).studentId("20260021").build();
        var group = StudyGroup.builder().id(10L).leader(leader)
                .contactEmail("leader@example.com").contactPhone("+82 10 1234 5678").build();
        when(groups.findById(10L)).thenReturn(Optional.of(group));
        when(members.findByGroupId(10L)).thenReturn(List.of(
                new GroupMember(group, leader, GroupRole.LEADER), new GroupMember(group, member, GroupRole.MEMBER)));

        var publicResponse = service.getGroupDetail(10L);
        assertEquals("****0020", publicResponse.getLeader().getStudentId());
        assertNull(publicResponse.getLeader().getEmail());
        assertEquals("leader@example.com", publicResponse.getContactEmail());
        assertEquals("+82 10 1234 5678", publicResponse.getContactPhone());
        assertEquals(List.of("****0020", "****0021"), publicResponse.getMembers().stream().map(m -> m.getStudentId()).toList());

        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated("20260020", null, AuthorityUtils.NO_AUTHORITIES));
        var ownerResponse = service.getGroupDetail(10L);
        assertEquals("****0020", ownerResponse.getLeader().getStudentId());
        assertNull(ownerResponse.getLeader().getEmail());
        assertEquals("****0020", ownerResponse.getMembers().get(0).getStudentId());
        assertEquals("****0021", ownerResponse.getMembers().get(1).getStudentId());
        assertEquals("20260021", member.getStudentId()); // Không sửa dữ liệu entity.
    }

    @Test
    void applicationResponseDoesNotExposeApplicantsIdToLeader() {
        var applications = mock(ApplicationRepository.class);
        var groups = mock(GroupRepository.class);
        var users = mock(UserRepository.class);
        var service = new ApplicationService(applications, groups, mock(GroupMemberRepository.class), users, mock(NotificationService.class));
        var leader = User.builder().id(1L).studentId("20260020").build();
        var applicant = User.builder().id(2L).studentId("20260021").email("20260021@soongsil.ac.kr").build();
        var group = StudyGroup.builder().id(10L).leader(leader).build();
        when(users.findByStudentId("20260020")).thenReturn(Optional.of(leader));
        when(groups.findById(10L)).thenReturn(Optional.of(group));
        when(applications.findByGroupIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(
                Application.builder().id(100L).group(group).applicant(applicant).build()));
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated("20260020", null, AuthorityUtils.NO_AUTHORITIES));

        var response = service.getGroupApplications(10L, "20260020").get(0);
        assertEquals("****0021", response.getApplicant().getStudentId());
        assertNull(response.getApplicant().getEmail());
    }
}
