package com.fullstack.escape_rentals.userreport.controller;

import com.fullstack.escape_rentals.security.CustomUserDetails;
import com.fullstack.escape_rentals.userreport.dto.request.CreateUserReportRequest;
import com.fullstack.escape_rentals.userreport.dto.request.UserReportFilterRequest;
import com.fullstack.escape_rentals.userreport.dto.request.UpdateUserReportStatusRequest;
import com.fullstack.escape_rentals.userreport.dto.response.UserReportResponse;
import com.fullstack.escape_rentals.userreport.service.UserReportService;
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
@RequestMapping("/api/user-reports")
@RequiredArgsConstructor
@Tag(name = "User Report Management")
public class UserReportController {

    private final UserReportService userReportService;

    // Any logged-in guest or host can report another user
    @PostMapping
    @PreAuthorize("hasAnyRole('USER','HOST')")
    public ResponseEntity<UserReportResponse> createUserReport(
            @Valid @RequestBody CreateUserReportRequest request,
            @AuthenticationPrincipal CustomUserDetails reporter) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userReportService.createUserReport(request, reporter));
    }

    // Reporter sees their own submissions
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER','HOST')")
    public ResponseEntity<Page<UserReportResponse>> getMyUserReports(
            @AuthenticationPrincipal CustomUserDetails user,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(userReportService.getMyUserReports(user.getId(), pageable));
    }

    // ---- Admin queue ----

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserReportResponse>> getUserReports(
            @ModelAttribute UserReportFilterRequest filter,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(userReportService.getFilteredUserReports(filter, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserReportResponse> getUserReportById(@PathVariable Long id) {
        return ResponseEntity.ok(userReportService.getUserReportById(id));
    }

    // Reports filed against a specific user — powers the admin user detail page
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserReportResponse>> getReportsForUser(
            @PathVariable Long userId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(userReportService.getReportsForUser(userId, pageable));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserReportResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserReportStatusRequest request) {

        return ResponseEntity.ok(userReportService.updateUserReportStatus(id, request));
    }
}
