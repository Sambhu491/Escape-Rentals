package com.fullstack.escape_rentals.report.dto.request;

import com.fullstack.escape_rentals.report.entity.ReportStatus;
import com.fullstack.escape_rentals.report.entity.ReportType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ReportFilterRequest {
    private ReportStatus status;
    private ReportType type;
    private Long propertyId;
    private Long reporterId;
    private LocalDate createdFrom;
    private LocalDate createdTo;
}