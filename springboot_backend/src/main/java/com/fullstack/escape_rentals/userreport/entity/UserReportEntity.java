package com.fullstack.escape_rentals.userreport.entity;

import com.fullstack.escape_rentals.common.entity.BaseEntity;
import com.fullstack.escape_rentals.report.entity.ReportStatus;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;

// A guest or host reporting ANOTHER user (fraud/abuse/etc) — deliberately its
// own table rather than reusing ReportEntity, since that one's FK is
// non-null-optional=false to PropertyEntity and can't target a user instead.
// Reuses report.entity.ReportStatus as-is (identical PENDING/UNDER_REVIEW/
// RESOLVED/REJECTED lifecycle, no reason to duplicate the enum).
@Entity
@Table(name = "user_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserReportEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reported_user_id", nullable = false)
    private UserEntity reportedUser;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id", nullable = false)
    private UserEntity reporter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private UserReportType type;

    @Column(nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    @Column(length = 1000)
    private String adminNote;
}
