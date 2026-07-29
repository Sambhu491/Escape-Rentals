package com.fullstack.escape_rentals.report.serviceImpl;

import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.exception.DuplicateResourceException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.notification.entity.NotificationType;
import com.fullstack.escape_rentals.notification.service.InAppNotificationService;
import com.fullstack.escape_rentals.notification.service.NotificationService;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.property.repository.PropertyRepository;
import com.fullstack.escape_rentals.report.dto.request.CreateReportRequest;
import com.fullstack.escape_rentals.report.dto.request.ReportFilterRequest;
import com.fullstack.escape_rentals.report.dto.request.UpdateReportStatusRequest;
import com.fullstack.escape_rentals.report.dto.response.ReportResponse;
import com.fullstack.escape_rentals.report.entity.ReportEntity;
import com.fullstack.escape_rentals.report.entity.ReportStatus;
import com.fullstack.escape_rentals.report.mapper.ReportMapper;
import com.fullstack.escape_rentals.report.repository.ReportRepository;
import com.fullstack.escape_rentals.report.service.ReportService;
import com.fullstack.escape_rentals.report.specification.ReportSpecification;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import com.fullstack.escape_rentals.user.entity.Role;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import com.fullstack.escape_rentals.user.repository.UserRepository;
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
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final ReportMapper mapper;
    private final NotificationService notificationService;
    private final InAppNotificationService inAppNotificationService;

    @Override
    public ReportResponse createReport(CreateReportRequest request,
                                       CustomUserDetails reporterDetails) {

        PropertyEntity property = propertyRepository
                .findByIdAndDeletedFalse(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        if (property.getHost().getId().equals(reporterDetails.getId())) {
            throw new BadRequestException("You cannot report your own property");
        }

        boolean alreadyOpen = reportRepository.existsByPropertyIdAndReporterIdAndStatus(
                property.getId(), reporterDetails.getId(), ReportStatus.PENDING);

        if (alreadyOpen) {
            throw new DuplicateResourceException(
                    "You already have a pending report for this property");
        }

        UserEntity reporter = userRepository.findById(reporterDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ReportEntity saved = reportRepository.save(
                mapper.toEntity(request, property, reporter));

        notifyAdmins(saved, property, reporter);

        inAppNotificationService.notifyAdmins(
                NotificationType.REPORT,
                "New property report",
                reporter.getFirstName() + " reported \"" + property.getTitle() + "\" (" + saved.getType().name() + ").",
                saved.getId()
        );

        return mapper.toResponse(saved);
    }

    private void notifyAdmins(ReportEntity report,
                              PropertyEntity property,
                              UserEntity reporter) {

        List<UserEntity> admins =
                userRepository.findByRoleAndDeletedFalseAndEnabledTrue(Role.ROLE_ADMIN);

        if (admins.isEmpty()) {
            log.warn("Report {} created but no active admin found to notify", report.getId());
            return;
        }

        String reporterName =
                reporter.getFirstName() + " " + reporter.getLastName();

        for (UserEntity admin : admins) {
            notificationService.sendPropertyReportToAdmin(
                    admin.getFirstName(),
                    admin.getEmail(),
                    report.getId(),
                    property.getId(),
                    property.getTitle(),
                    reporterName,
                    report.getType().name(),
                    report.getDescription()
            );
        }
    }


    @Override
    @Transactional(readOnly = true)
    public ReportResponse getReportById(Long id) {
        return mapper.toResponse(
                reportRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Report not found")));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportResponse> getFilteredReports(ReportFilterRequest filter,
                                                   Pageable pageable) {
        Specification<ReportEntity> spec = Specification
                .where(ReportSpecification.hasStatus(filter.getStatus()))
                .and(ReportSpecification.hasType(filter.getType()))
                .and(ReportSpecification.hasPropertyId(filter.getPropertyId()))
                .and(ReportSpecification.hasReporterId(filter.getReporterId()))
                .and(ReportSpecification.createdAfter(filter.getCreatedFrom()))
                .and(ReportSpecification.createdBefore(filter.getCreatedTo()));

        return reportRepository.findAll(spec, pageable).map(mapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportResponse> getMyReports(Long reporterId, Pageable pageable) {
        return reportRepository.findByReporterId(reporterId, pageable)
                .map(mapper::toResponse);
    }

    @Override
    public ReportResponse updateReportStatus(Long id, UpdateReportStatusRequest request) {

        ReportEntity report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        report.setStatus(request.getStatus());

        if (request.getAdminNote() != null) {
            report.setAdminNote(request.getAdminNote());
        }

        ReportEntity saved = reportRepository.save(report);

        if (saved.getReporter() != null) {
            inAppNotificationService.notify(
                    saved.getReporter(),
                    NotificationType.REPORT,
                    "Report update",
                    "Your report on \"" + (saved.getProperty() != null ? saved.getProperty().getTitle() : "a property") +
                            "\" is now " + saved.getStatus().name().toLowerCase().replace('_', ' ') + ".",
                    saved.getId()
            );
        }

        return mapper.toResponse(saved);
    }
}

