package com.fullstack.escape_rentals.notification.repository;

import com.fullstack.escape_rentals.notification.entity.NotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    Page<NotificationEntity> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    long countByRecipientIdAndReadFalse(Long recipientId);

    // Backs the navbar's unread red-dot — lets it clear the instant the
    // notifications page is opened, without fetching every row individually.
    @Modifying
    @Query("UPDATE NotificationEntity n SET n.read = true WHERE n.recipient.id = :recipientId AND n.read = false")
    int markAllAsReadForRecipient(@Param("recipientId") Long recipientId);

    @Transactional
    @Modifying
    @Query("DELETE FROM NotificationEntity n WHERE n.recipient.id = :recipientId")
    void deleteAllByRecipientId(Long recipientId);

}
