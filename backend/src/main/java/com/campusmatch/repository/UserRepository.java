package com.campusmatch.repository;

import com.campusmatch.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm kiếm sinh viên theo Mã số sinh viên u-SAINT
    Optional<User> findByStudentId(String studentId);
}
