package com.fullstack.escape_rentals.report.specification;

import com.fullstack.escape_rentals.report.entity.ReportEntity;
import com.fullstack.escape_rentals.report.entity.ReportStatus;
import com.fullstack.escape_rentals.report.entity.ReportType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class ReportSpecification {

    private ReportSpecification() {}

    public static Specification<ReportEntity> hasStatus(ReportStatus status) {
        return (root, query, cb) ->
                status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<ReportEntity> hasType(ReportType type) {
        return (root, query, cb) ->
                type == null ? cb.conjunction() : cb.equal(root.get("type"), type);
    }

    public static Specification<ReportEntity> hasPropertyId(Long propertyId) {
        return (root, query, cb) ->
                propertyId == null ? cb.conjunction()
                        : cb.equal(root.get("property").get("id"), propertyId);
    }

    public static Specification<ReportEntity> hasReporterId(Long reporterId) {
        return (root, query, cb) ->
                reporterId == null ? cb.conjunction()
                        : cb.equal(root.get("reporter").get("id"), reporterId);
    }

    public static Specification<ReportEntity> createdAfter(LocalDate from) {
        return (root, query, cb) ->
                from == null ? cb.conjunction()
                        : cb.greaterThanOrEqualTo(root.get("createdAt"), from.atStartOfDay());
    }

    public static Specification<ReportEntity> createdBefore(LocalDate to) {
        return (root, query, cb) ->
                to == null ? cb.conjunction()
                        : cb.lessThanOrEqualTo(root.get("createdAt"), to.atTime(23, 59, 59));
    }
}
