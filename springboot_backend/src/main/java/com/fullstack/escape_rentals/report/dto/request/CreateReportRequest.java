package com.fullstack.escape_rentals.report.dto.request;

import com.fullstack.escape_rentals.report.entity.ReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReportRequest {

    @NotNull(message = "Property id is required")
    private Long propertyId;

    @NotNull(message = "Report type is required")
    private ReportType type;

    @NotBlank(message = "Description is required")
    @Size(max = 2000)
    private String description;
}
