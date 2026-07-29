package com.fullstack.escape_rentals.userreport.service;

import com.fullstack.escape_rentals.userreport.dto.request.CreateUserReportRequest;
import com.fullstack.escape_rentals.userreport.dto.request.UserReportFilterRequest;
import com.fullstack.escape_rentals.userreport.dto.request.UpdateUserReportStatusRequest;
import com.fullstack.escape_rentals.userreport.dto.response.UserReportResponse;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserReportService {
    UserReportResponse createUserReport(CreateUserReportRequest request, CustomUserDetails reporter);
    UserReportResponse getUserReportById(Long id);
    Page<UserReportResponse> getFilteredUserReports(UserReportFilterRequest filter, Pageable pageable);
    Page<UserReportResponse> getMyUserReports(Long reporterId, Pageable pageable);
    Page<UserReportResponse> getReportsForUser(Long reportedUserId, Pageable pageable);
    UserReportResponse updateUserReportStatus(Long id, UpdateUserReportStatusRequest request);
}
