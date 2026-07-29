package com.fullstack.escape_rentals.userreport.dto.request;

import com.fullstack.escape_rentals.userreport.entity.UserReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserReportRequest {

    @NotNull(message = "Reported user id is required")
    private Long reportedUserId;

    @NotNull(message = "Report type is required")
    private UserReportType type;

    @NotBlank(message = "Description is required")
    @Size(max = 2000)
    private String description;
}
