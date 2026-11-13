package com.campusmatch.repository;

import com.campusmatch.entity.GroupStatus;
import com.campusmatch.entity.StudyGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<StudyGroup, Long>, JpaSpecificationExecutor<StudyGroup> {

    List<StudyGroup> findByLeaderId(Long leaderId);

    Page<StudyGroup> findByStatus(GroupStatus status, Pageable pageable);

    long countByStatus(GroupStatus status);

    /**
     * Lấy danh sách các năm (post_year) có nhóm tồn tại, sắp xếp giảm dần.
     * Dùng cho filter năm trên trang Groups.
     */
    @Query("SELECT DISTINCT g.postYear FROM StudyGroup g ORDER BY g.postYear DESC")
    List<Integer> findDistinctPostYears();
}

