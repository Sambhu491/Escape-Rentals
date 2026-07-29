package com.fullstack.escape_rentals.notification.serviceImpl;

import com.fullstack.escape_rentals.exception.AccessDeniedException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.notification.dto.response.NotificationResponse;
import com.fullstack.escape_rentals.notification.entity.NotificationEntity;
import com.fullstack.escape_rentals.notification.entity.NotificationType;
import com.fullstack.escape_rentals.notification.repository.NotificationRepository;
import com.fullstack.escape_rentals.notification.service.InAppNotificationService;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import com.fullstack.escape_rentals.user.entity.Role;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import com.fullstack.escape_rentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class InAppNotificationServiceImpl implements InAppNotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private NotificationResponse toResponse(NotificationEntity entity) {
        return NotificationResponse.builder()
                .id(entity.getId())
                .type(entity.getType())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .relatedEntityId(entity.getRelatedEntityId())
                .read(entity.isRead())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    // REQUIRES_NEW so a notification failure never rolls back the booking/
    // payment/review action it's attached to — this is a courtesy side effect,
    // not part of the core transaction.
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notify(UserEntity recipient, NotificationType type, String title, String message, Long relatedEntityId) {
        if (recipient == null) return;

        try {
            NotificationEntity entity = NotificationEntity.builder()
                    .recipient(recipient)
                    .type(type)
                    .title(title)
                    .message(message)
                    .relatedEntityId(relatedEntityId)
                    .build();

            notificationRepository.save(entity);
        } catch (Exception e) {
            log.warn("Failed to create in-app notification for user {}", recipient.getId(), e);
        }
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyAdmins(NotificationType type, String title, String message, Long relatedEntityId) {
        for (UserEntity admin : userRepository.findByRoleAndDeletedFalseAndEnabledTrue(Role.ROLE_ADMIN)) {
            notify(admin, type, title, message, relatedEntityId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(Long recipientId, Pageable pageable) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long id, CustomUserDetails currentUser) {

        NotificationEntity entity = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!entity.getRecipient().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Not allowed to modify this notification");
        }

        entity.setRead(true);

        return toResponse(notificationRepository.save(entity));
    }

    @Override
    @Transactional
    public void markAllAsRead(CustomUserDetails currentUser) {
        notificationRepository.markAllAsReadForRecipient(currentUser.getId());
    }

    @Override
    @Transactional
    public void deleteNotification(Long id, CustomUserDetails currentUser) {
        NotificationEntity entity = notificationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found")
                );
        if (!entity.getRecipient().getId()
                .equals(currentUser.getId())) {
            throw new AccessDeniedException(
                    "Not allowed to delete this notification"
            );
        }
        notificationRepository.delete(entity);
    }


    @Override
    @Transactional
    public void deleteAllNotifications(CustomUserDetails currentUser) {

        notificationRepository.deleteAllByRecipientId(
                currentUser.getId()
        );
    }



}
