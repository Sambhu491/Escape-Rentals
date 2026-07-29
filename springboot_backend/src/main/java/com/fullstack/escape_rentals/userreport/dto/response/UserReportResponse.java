package com.fullstack.escape_rentals.userreport.dto.response;

import com.fullstack.escape_rentals.report.entity.ReportStatus;
import com.fullstack.escape_rentals.userreport.entity.UserReportType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserReportResponse {
    private Long id;
    private Long reportedUserId;
    private String reportedUserName;
    private String reportedUserRole;
    private Long reporterId;
    private String reporterName;
    private UserReportType type;
    private String description;
    private ReportStatus status;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
