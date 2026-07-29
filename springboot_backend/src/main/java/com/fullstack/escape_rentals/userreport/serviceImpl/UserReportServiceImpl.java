package com.fullstack.escape_rentals.userreport.serviceImpl;

import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.exception.DuplicateResourceException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.notification.entity.NotificationType;
import com.fullstack.escape_rentals.notification.service.InAppNotificationService;
import com.fullstack.escape_rentals.notification.service.NotificationService;
import com.fullstack.escape_rentals.report.entity.ReportStatus;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import com.fullstack.escape_rentals.user.entity.Role;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import com.fullstack.escape_rentals.user.repository.UserRepository;
import com.fullstack.escape_rentals.userreport.dto.request.CreateUserReportRequest;
import com.fullstack.escape_rentals.userreport.dto.request.UpdateUserReportStatusRequest;
import com.fullstack.escape_rentals.userreport.dto.request.UserReportFilterRequest;
import com.fullstack.escape_rentals.userreport.dto.response.UserReportResponse;
import com.fullstack.escape_rentals.userreport.entity.UserReportEntity;
import com.fullstack.escape_rentals.userreport.mapper.UserReportMapper;
import com.fullstack.escape_rentals.userreport.repository.UserReportRepository;
import com.fullstack.escape_rentals.userreport.service.UserReportService;
import com.fullstack.escape_rentals.userreport.specification.UserReportSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserReportServiceImpl implements UserReportService {

    private final UserReportRepository userReportRepository;
    private final UserRepository userRepository;
    private final UserReportMapper mapper;
    private final NotificationService notificationService;
    private final InAppNotificationService inAppNotificationService;

    @Override
    public UserReportResponse createUserReport(CreateUserReportRequest request,
                                                CustomUserDetails reporterDetails) {

        if (request.getReportedUserId().equals(reporterDetails.getId())) {
            throw new BadRequestException("You cannot report yourself");
        }

        UserEntity reportedUser = userRepository.findById(request.getReportedUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean alreadyOpen = userReportRepository.existsByReportedUserIdAndReporterIdAndStatus(
                reportedUser.getId(), reporterDetails.getId(), ReportStatus.PENDING);

        if (alreadyOpen) {
            throw new DuplicateResourceException(
                    "You already have a pending report for this user");
        }

        UserEntity reporter = userRepository.findById(reporterDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserReportEntity saved = userReportRepository.save(
                mapper.toEntity(request, reportedUser, reporter));

        notifyAdmins(saved, reportedUser, reporter);

        inAppNotificationService.notifyAdmins(
                NotificationType.USER_REPORT,
                "New user report",
                reporter.getFirstName() + " reported " + reportedUser.getFirstName()
                        + " " + reportedUser.getLastName() + " (" + saved.getType().name() + ").",
                reportedUser.getId()
        );

        return mapper.toResponse(saved);
    }

    private void notifyAdmins(UserReportEntity report,
                               UserEntity reportedUser,
                               UserEntity reporter) {

        List<UserEntity> admins =
                userRepository.findByRoleAndDeletedFalseAndEnabledTrue(Role.ROLE_ADMIN);

        if (admins.isEmpty()) {
            log.warn("User report {} created but no active admin found to notify", report.getId());
            return;
        }

        String reporterName = reporter.getFirstName() + " " + reporter.getLastName();
        String reportedUserName = reportedUser.getFirstName() + " " + reportedUser.getLastName();

        for (UserEntity admin : admins) {
            notificationService.sendUserReportToAdmin(
                    admin.getFirstName(),
                    admin.getEmail(),
                    report.getId(),
                    reportedUser.getId(),
                    reportedUserName,
                    reporterName,
                    report.getType().name(),
                    report.getDescription()
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserReportResponse getUserReportById(Long id) {
        return mapper.toResponse(
                userReportRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("User report not found")));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserReportResponse> getFilteredUserReports(UserReportFilterRequest filter,
                                                            Pageable pageable) {
        Specification<UserReportEntity> spec = Specification
                .where(UserReportSpecification.hasStatus(filter.getStatus()))
                .and(UserReportSpecification.hasType(filter.getType()))
                .and(UserReportSpecification.hasReportedUserId(filter.getReportedUserId()));

        return userReportRepository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserReportResponse> getMyUserReports(Long reporterId, Pageable pageable) {
        return userReportRepository.findByReporterId(reporterId, pageable)
                .map(mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserReportResponse> getReportsForUser(Long reportedUserId, Pageable pageable) {
        return userReportRepository.findByReportedUserId(reportedUserId, pageable)
                .map(mapper::toResponse);
    }

    @Override
    public UserReportResponse updateUserReportStatus(Long id, UpdateUserReportStatusRequest request) {

        UserReportEntity report = userReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User report not found"));

        report.setStatus(request.getStatus());

        if (request.getAdminNote() != null) {
            report.setAdminNote(request.getAdminNote());
        }

        UserReportEntity saved = userReportRepository.save(report);

        if (saved.getReporter() != null) {
            inAppNotificationService.notify(
                    saved.getReporter(),
                    NotificationType.USER_REPORT,
                    "Report update",
                    "Your report on " + saved.getReportedUser().getFirstName() +
                            " is now " + saved.getStatus().name().toLowerCase().replace('_', ' ') + ".",
                    saved.getId()
            );
        }

        return mapper.toResponse(saved);
    }
}
