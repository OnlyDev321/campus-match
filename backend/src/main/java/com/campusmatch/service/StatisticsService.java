package com.campusmatch.service;

import com.campusmatch.dto.PublicStatisticsResponse;
import com.campusmatch.entity.GroupStatus;
import com.campusmatch.repository.GroupRepository;
import com.campusmatch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StatisticsService {
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;

    // Dùng COUNT tại database; ba số cùng một snapshot, không tải danh sách về bộ nhớ.
    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public PublicStatisticsResponse getPublicStatistics() {
        return new PublicStatisticsResponse(
                userRepository.countByLastLoginAtIsNotNull(),
                groupRepository.countByStatus(GroupStatus.RECRUITING),
                groupRepository.countByStatus(GroupStatus.COMPLETED));
    }
}
