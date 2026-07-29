package com.fullstack.escape_rentals.notification.service;

import com.fullstack.escape_rentals.notification.dto.response.NotificationResponse;
import com.fullstack.escape_rentals.notification.entity.NotificationType;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

// Distinct from NotificationService (email) — this persists lightweight
// in-app notification rows for the account "Notifications" section.
public interface InAppNotificationService {

    void notify(UserEntity recipient, NotificationType type, String title, String message, Long relatedEntityId);

    // Fans out to every active admin — reuses the same lookup ReportServiceImpl
    // already relies on for the "notify admins" email flow.
    void notifyAdmins(NotificationType type, String title, String message, Long relatedEntityId);

    Page<NotificationResponse> getMyNotifications(Long recipientId, Pageable pageable);

    NotificationResponse markAsRead(Long id, CustomUserDetails currentUser);

    void markAllAsRead(CustomUserDetails currentUser);

    void deleteNotification(Long id, CustomUserDetails currentUser);

    void deleteAllNotifications(CustomUserDetails currentUser);


}
