package com.fullstack.escape_rentals.userreport.mapper;

import com.fullstack.escape_rentals.user.entity.UserEntity;
import com.fullstack.escape_rentals.userreport.dto.request.CreateUserReportRequest;
import com.fullstack.escape_rentals.userreport.dto.response.UserReportResponse;
import com.fullstack.escape_rentals.userreport.entity.UserReportEntity;
import com.fullstack.escape_rentals.userreport.entity.UserReportType;
import org.springframework.stereotype.Component;

@Component
public class UserReportMapper {

    public UserReportEntity toEntity(CreateUserReportRequest request,
                                      UserEntity reportedUser,
                                      UserEntity reporter) {
        return UserReportEntity.builder()
                .reportedUser(reportedUser)
                .reporter(reporter)
                .type(request.getType())
                .description(request.getDescription())
                .build();
    }

    public UserReportResponse toResponse(UserReportEntity entity) {
        if (entity == null) return null;

        UserEntity reportedUser = entity.getReportedUser();
        UserEntity reporter = entity.getReporter();

        return UserReportResponse.builder()
                .id(entity.getId())
                .reportedUserId(reportedUser.getId())
                .reportedUserName(reportedUser.getFirstName() + " " + reportedUser.getLastName())
                .reportedUserRole(reportedUser.getRole().name())
                .reporterId(reporter.getId())
                .reporterName(reporter.getFirstName() + " " + reporter.getLastName())
                .type(entity.getType())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .adminNote(entity.getAdminNote())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
