package com.fullstack.escape_rentals.report.entity;

import com.fullstack.escape_rentals.common.entity.BaseEntity;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private PropertyEntity property;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id", nullable = false)
    private UserEntity reporter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ReportType type;

    @Column(nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    @Column(length = 1000)
    private String adminNote;
}
