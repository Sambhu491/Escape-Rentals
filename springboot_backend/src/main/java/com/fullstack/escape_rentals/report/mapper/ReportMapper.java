package com.fullstack.escape_rentals.report.mapper;

import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.report.dto.request.CreateReportRequest;
import com.fullstack.escape_rentals.report.dto.response.ReportResponse;
import com.fullstack.escape_rentals.report.entity.ReportEntity;
import com.fullstack.escape_rentals.report.entity.ReportStatus;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class ReportMapper {

    public ReportEntity toEntity(CreateReportRequest request,
                                 PropertyEntity property,
                                 UserEntity reporter) {
        return ReportEntity.builder()
                .property(property)
                .reporter(reporter)
                .type(request.getType())
                .description(request.getDescription())
                .status(ReportStatus.PENDING)
                .build();
    }

    public ReportResponse toResponse(ReportEntity entity) {
        if (entity == null) return null;

        return ReportResponse.builder()
                .id(entity.getId())
                .propertyId(entity.getProperty().getId())
                .propertyTitle(entity.getProperty().getTitle())
                .reporterId(entity.getReporter().getId())
                .reporterName(
                        entity.getReporter().getFirstName() + " "
                                + entity.getReporter().getLastName())
                .type(entity.getType())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .adminNote(entity.getAdminNote())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
