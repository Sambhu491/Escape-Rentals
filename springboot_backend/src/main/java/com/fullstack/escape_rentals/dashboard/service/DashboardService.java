package com.fullstack.escape_rentals.dashboard.service;

import com.fullstack.escape_rentals.dashboard.dto.response.AdminDashboardResponse;
import com.fullstack.escape_rentals.dashboard.dto.response.HostDashboardResponse;
import com.fullstack.escape_rentals.dashboard.dto.response.UserDashboardResponse;

public interface DashboardService {
    HostDashboardResponse getHostDashboard(Long hostId);
    UserDashboardResponse getUserDashboard(Long userId);
    AdminDashboardResponse getAdminDashboard();
}
