package com.fullstack.escape_rentals.userreport.repository;

import com.fullstack.escape_rentals.report.entity.ReportStatus;
import com.fullstack.escape_rentals.userreport.entity.UserReportEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UserReportRepository extends JpaRepository<UserReportEntity, Long>,
        JpaSpecificationExecutor<UserReportEntity> {

    boolean existsByReportedUserIdAndReporterIdAndStatus(
            Long reportedUserId, Long reporterId, ReportStatus status);

    Page<UserReportEntity> findByReporterId(Long reporterId, Pageable pageable);

    Page<UserReportEntity> findByReportedUserId(Long reportedUserId, Pageable pageable);

    long countByStatus(ReportStatus status);
}
