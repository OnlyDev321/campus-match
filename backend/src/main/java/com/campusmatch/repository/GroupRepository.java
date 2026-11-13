package com.campusmatch.repository;

import com.campusmatch.entity.GroupStatus;
import com.campusmatch.entity.StudyGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<StudyGroup, Long>, JpaSpecificationExecutor<StudyGroup> {

    List<StudyGroup> findByLeaderId(Long leaderId);

    Page<StudyGroup> findByStatus(GroupStatus status, Pageable pageable);

    long countByStatus(GroupStatus status);
}

