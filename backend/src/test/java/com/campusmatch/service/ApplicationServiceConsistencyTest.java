package com.campusmatch.service;

import com.campusmatch.entity.*;
import com.campusmatch.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ApplicationServiceConsistencyTest {
    private final ApplicationRepository applications = mock(ApplicationRepository.class);
    private final GroupRepository groups = mock(GroupRepository.class);
    private final GroupMemberRepository members = mock(GroupMemberRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final NotificationService notifications = mock(NotificationService.class);
    private final ApplicationService service = new ApplicationService(applications, groups, members, users, notifications);

    private Application application(ApplicationStatus status) {
        User leader = User.builder().id(1L).studentId("20260020").name("Leader").build();
        User applicant = User.builder().id(2L).studentId("20260021").name("Applicant").build();
        StudyGroup group = StudyGroup.builder().id(10L).leader(leader).maxMembers(4).build();
        return Application.builder().id(5L).group(group).applicant(applicant).status(status).statement("Hello").build();
    }

    @Test
    void cannotAcceptRejectedApplication() {
        Application application = application(ApplicationStatus.REJECTED);
        when(users.findByStudentId("20260020")).thenReturn(Optional.of(application.getGroup().getLeader()));
        when(applications.findById(5L)).thenReturn(Optional.of(application));

        assertThrows(ResponseStatusException.class, () -> service.acceptApplication(5L, "20260020"));
        verify(members, never()).save(any());
        verify(applications, never()).save(any());
    }

    @Test
    void cannotRejectAcceptedApplication() {
        Application application = application(ApplicationStatus.ACCEPTED);
        when(users.findByStudentId("20260020")).thenReturn(Optional.of(application.getGroup().getLeader()));
        when(applications.findById(5L)).thenReturn(Optional.of(application));

        assertThrows(ResponseStatusException.class, () -> service.rejectApplication(5L, "20260020"));
        verify(applications, never()).save(any());
        verifyNoInteractions(notifications);
    }

    @Test
    void myApplicationsReturnsOnlyCurrentApplicantsRecords() {
        Application application = application(ApplicationStatus.PENDING);
        when(users.findByStudentId("20260021")).thenReturn(Optional.of(application.getApplicant()));
        when(applications.findByApplicantId(2L)).thenReturn(List.of(application));

        var result = service.getMyApplications("20260021");

        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).getGroupId());
        assertEquals(ApplicationStatus.PENDING, result.get(0).getStatus());
        verify(applications).findByApplicantId(2L);
    }
}
