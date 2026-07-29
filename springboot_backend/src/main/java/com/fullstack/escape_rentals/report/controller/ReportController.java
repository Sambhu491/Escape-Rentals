package com.fullstack.escape_rentals.report.controller;

import com.fullstack.escape_rentals.report.dto.request.CreateReportRequest;
import com.fullstack.escape_rentals.report.dto.request.ReportFilterRequest;
import com.fullstack.escape_rentals.report.dto.request.UpdateReportStatusRequest;
import com.fullstack.escape_rentals.report.dto.response.ReportResponse;
import com.fullstack.escape_rentals.report.service.ReportService;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Report Management")
public class ReportController {

    private final ReportService reportService;

    // Any logged-in guest or host can raise a report
    @PostMapping
    @PreAuthorize("hasAnyRole('USER','HOST')")
    public ResponseEntity<ReportResponse> createReport(
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal CustomUserDetails reporter) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reportService.createReport(request, reporter));
    }

    // Reporter sees their own submissions
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER','HOST')")
    public ResponseEntity<Page<ReportResponse>> getMyReports(
            @AuthenticationPrincipal CustomUserDetails user,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(reportService.getMyReports(user.getId(), pageable));
    }

    // ---- Admin queue ----

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReportResponse>> getReports(
            @ModelAttribute ReportFilterRequest filter,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(reportService.getFilteredReports(filter, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReportResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReportStatusRequest request) {

        return ResponseEntity.ok(reportService.updateReportStatus(id, request));
    }
}
