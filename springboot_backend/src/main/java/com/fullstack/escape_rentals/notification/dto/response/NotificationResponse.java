package com.fullstack.escape_rentals.notification.dto.response;

import com.fullstack.escape_rentals.notification.entity.NotificationType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private Long relatedEntityId;
    private boolean read;
    private LocalDateTime createdAt;
}
