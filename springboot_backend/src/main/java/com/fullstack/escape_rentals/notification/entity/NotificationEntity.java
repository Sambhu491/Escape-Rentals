package com.fullstack.escape_rentals.notification.entity;

import com.fullstack.escape_rentals.common.entity.BaseEntity;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;

// In-app notification record — separate from NotificationService, which only
// sends email. This is the lightweight persistence scaffold for the
// notifications section: create + list + mark-read now, removal deferred.
@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private UserEntity recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    // Id of the booking/review/report/etc. this notification is about —
    // nullable, kept for when the UI later wires up deep-linking.
    private Long relatedEntityId;

    // Bug fix: "read" is a reserved word in MySQL's grammar. Left unquoted
    // (Hibernate's default), every query against this table failed with a SQL
    // syntax error — which is why /api/notifications/my 500'd directly, and
    // why booking approve/reject/cancel and payment verify also started
    // 500'ing: they all call InAppNotificationService.notify(), whose insert
    // hit this same broken column, and even though that failure is caught in
    // Java, the @Transactional(REQUIRES_NEW) wrapper still throws
    // UnexpectedRollbackException on commit — which is not caught, and
    // propagates into the calling booking/payment transaction.
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;
}
