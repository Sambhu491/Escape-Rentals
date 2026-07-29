package com.fullstack.escape_rentals.dashboard.controller;

import com.fullstack.escape_rentals.dashboard.dto.response.UserDashboardResponse;
import com.fullstack.escape_rentals.dashboard.service.DashboardService;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile/user")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
@Tag(name = "User Dashboard")
public class UserDashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<UserDashboardResponse> dashboard(
            @AuthenticationPrincipal CustomUserDetails user
    ) {

        return ResponseEntity.ok(
                dashboardService.getUserDashboard(user.getId())
        );
    }
}
