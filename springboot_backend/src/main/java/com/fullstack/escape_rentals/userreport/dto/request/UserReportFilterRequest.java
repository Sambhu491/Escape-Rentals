package com.fullstack.escape_rentals.userreport.dto.request;

import com.fullstack.escape_rentals.report.entity.ReportStatus;
import com.fullstack.escape_rentals.userreport.entity.UserReportType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserReportFilterRequest {
    private ReportStatus status;
    private UserReportType type;
    private Long reportedUserId;
}
