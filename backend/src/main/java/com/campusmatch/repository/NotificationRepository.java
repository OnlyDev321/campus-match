package com.campusmatch.repository;

import com.campusmatch.entity.Notification;
import com.campusmatch.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    long countByRecipientAndIsReadFalse(User recipient);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient = :recipient AND n.isRead = false")
    void markAllAsRead(@Param("recipient") User recipient);

    void deleteByRecipient(User recipient);

    @Modifying
    @Query("UPDATE Notification n SET n.group = null WHERE n.group.id = :groupId")
    void nullifyGroupReference(@Param("groupId") Long groupId);
}

