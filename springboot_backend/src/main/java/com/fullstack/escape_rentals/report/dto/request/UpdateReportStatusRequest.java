package com.fullstack.escape_rentals.report.dto.request;


import com.fullstack.escape_rentals.report.entity.ReportStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateReportStatusRequest {

    @NotNull(message = "Status is required")
    private ReportStatus status;

    @Size(max = 1000)
    private String adminNote;
}