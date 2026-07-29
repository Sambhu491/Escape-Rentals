package com.fullstack.escape_rentals.report.repository;

import com.fullstack.escape_rentals.report.dto.response.ReportResponse;
import com.fullstack.escape_rentals.report.entity.ReportEntity;
import com.fullstack.escape_rentals.report.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ReportRepository extends JpaRepository<ReportEntity,Long> , JpaSpecificationExecutor<ReportEntity> {

    boolean existsByPropertyIdAndReporterIdAndStatus(
            Long propertyId, Long reporterId, ReportStatus status);

    Page<ReportEntity> findByReporterId(Long reporterId, Pageable pageable);

    long countByStatus(ReportStatus status);
}
