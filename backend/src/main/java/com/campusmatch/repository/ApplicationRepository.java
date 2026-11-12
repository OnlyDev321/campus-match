package com.campusmatch.repository;

import com.campusmatch.entity.Application;
import com.campusmatch.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByGroupId(Long groupId);

    List<Application> findByApplicantId(Long applicantId);

    Optional<Application> findByGroupIdAndApplicantId(Long groupId, Long applicantId);

    long countByGroupIdAndStatus(Long groupId, ApplicationStatus status);

    boolean existsByGroupIdAndApplicantId(Long groupId, Long applicantId);
}

