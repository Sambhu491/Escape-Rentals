package com.fullstack.escape_rentals.userreport.specification;

import com.fullstack.escape_rentals.report.entity.ReportStatus;
import com.fullstack.escape_rentals.userreport.entity.UserReportEntity;
import com.fullstack.escape_rentals.userreport.entity.UserReportType;
import org.springframework.data.jpa.domain.Specification;

public class UserReportSpecification {

    private UserReportSpecification() {}

    public static Specification<UserReportEntity> hasStatus(ReportStatus status) {
        return (root, query, cb) ->
                status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<UserReportEntity> hasType(UserReportType type) {
        return (root, query, cb) ->
                type == null ? cb.conjunction() : cb.equal(root.get("type"), type);
    }

    public static Specification<UserReportEntity> hasReportedUserId(Long reportedUserId) {
        return (root, query, cb) ->
                reportedUserId == null ? cb.conjunction()
                        : cb.equal(root.get("reportedUser").get("id"), reportedUserId);
    }
}
