package com.fullstack.escape_rentals.dashboard.controller;

import com.fullstack.escape_rentals.dashboard.dto.response.AdminDashboardResponse;
import com.fullstack.escape_rentals.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Dashboard")
public class AdminDashboardController {
    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<AdminDashboardResponse> dashboard() {

        return ResponseEntity.ok(
                dashboardService.getAdminDashboard()
        );
    }
}
