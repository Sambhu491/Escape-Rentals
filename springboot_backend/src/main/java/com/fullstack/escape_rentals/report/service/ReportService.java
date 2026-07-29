package com.fullstack.escape_rentals.report.service;

import com.fullstack.escape_rentals.report.dto.request.CreateReportRequest;
import com.fullstack.escape_rentals.report.dto.request.ReportFilterRequest;
import com.fullstack.escape_rentals.report.dto.request.UpdateReportStatusRequest;
import com.fullstack.escape_rentals.report.dto.response.ReportResponse;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReportService {
    ReportResponse createReport(CreateReportRequest request, CustomUserDetails reporter);
    ReportResponse getReportById(Long id);
    Page<ReportResponse> getFilteredReports(ReportFilterRequest filter, Pageable pageable);
    Page<ReportResponse> getMyReports(Long reporterId, Pageable pageable);
    ReportResponse updateReportStatus(Long id, UpdateReportStatusRequest request);
}
