package com.fullstack.escape_rentals.dashboard.controller;

import com.fullstack.escape_rentals.dashboard.dto.response.HostDashboardResponse;
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
@RequestMapping("/api/profile/host")
@RequiredArgsConstructor
@PreAuthorize("hasRole('HOST')")
@Tag(name = "Host Dashboard")
public class HostDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<HostDashboardResponse> dashboard(
            @AuthenticationPrincipal CustomUserDetails user
    ) {

        return ResponseEntity.ok(
                dashboardService.getHostDashboard(user.getId())
        );
    }
}