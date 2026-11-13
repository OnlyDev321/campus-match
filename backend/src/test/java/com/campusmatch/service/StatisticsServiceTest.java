package com.campusmatch.service;

import com.campusmatch.entity.GroupStatus;
import com.campusmatch.repository.GroupRepository;
import com.campusmatch.repository.UserRepository;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StatisticsServiceTest {
    @Test
    void countsVerifiedUsersAndEachRecruitmentStatusWithoutLoadingLists() {
        var users = mock(UserRepository.class);
        var groups = mock(GroupRepository.class);
        when(users.countByLastLoginAtIsNotNull()).thenReturn(27L);
        when(groups.countByStatus(GroupStatus.RECRUITING)).thenReturn(8L);
        when(groups.countByStatus(GroupStatus.COMPLETED)).thenReturn(3L);

        var result = new StatisticsService(users, groups).getPublicStatistics();

        assertEquals(27L, result.verifiedStudents());
        assertEquals(8L, result.recruitingGroups());
        assertEquals(3L, result.fullGroups());
        verify(users).countByLastLoginAtIsNotNull();
        verify(groups).countByStatus(GroupStatus.RECRUITING);
        verify(groups).countByStatus(GroupStatus.COMPLETED);
        verifyNoMoreInteractions(users, groups);
    }

    @Test
    void emptyDatabaseReturnsActualZeroCounts() {
        var service = new StatisticsService(mock(UserRepository.class), mock(GroupRepository.class));
        var result = service.getPublicStatistics();
        assertEquals(0L, result.verifiedStudents());
        assertEquals(0L, result.recruitingGroups());
        assertEquals(0L, result.fullGroups());
    }

    @Test
    void databaseFailureDoesNotBecomeFakeZeroOrSampleNumbers() {
        var users = mock(UserRepository.class);
        when(users.countByLastLoginAtIsNotNull()).thenThrow(new IllegalStateException("Database unavailable"));
        var service = new StatisticsService(users, mock(GroupRepository.class));
        assertThrows(IllegalStateException.class, service::getPublicStatistics);
    }
}
