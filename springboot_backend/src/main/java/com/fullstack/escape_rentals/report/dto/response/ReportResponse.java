package com.fullstack.escape_rentals.report.dto.response;

import com.fullstack.escape_rentals.report.entity.ReportStatus;
import com.fullstack.escape_rentals.report.entity.ReportType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private Long id;
    private Long propertyId;
    private String propertyTitle;
    private Long reporterId;
    private String reporterName;
    private ReportType type;
    private String description;
    private ReportStatus status;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}