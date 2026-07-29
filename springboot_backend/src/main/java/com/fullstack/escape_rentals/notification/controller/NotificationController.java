package com.fullstack.escape_rentals.notification.controller;

import com.fullstack.escape_rentals.notification.dto.response.NotificationResponse;
import com.fullstack.escape_rentals.notification.service.InAppNotificationService;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

// Deliberately minimal — list + mark-read only. Removal is a later addition
// once the UI side of notifications is actually being used.
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications")
public class NotificationController {

    private final InAppNotificationService notificationService;

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER','HOST','ADMIN')")
    public ResponseEntity<Page<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails user,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(
                notificationService.getMyNotifications(user.getId(), pageable)
        );
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('USER','HOST','ADMIN')")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                notificationService.markAsRead(id, user)
        );
    }

    // Backs the navbar bell's unread indicator — clears it the moment the
    // notifications page is opened, matching the Instagram/Facebook/Airbnb
    // pattern of "seen" clearing on open rather than requiring each item to
    // be tapped individually.
    @PatchMapping("/read-all")
    @PreAuthorize("hasAnyRole('USER','HOST','ADMIN')")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        notificationService.markAllAsRead(user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        notificationService.deleteNotification(id, user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAll(
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        notificationService.deleteAllNotifications(user);
        return ResponseEntity.noContent().build();
    }


}
