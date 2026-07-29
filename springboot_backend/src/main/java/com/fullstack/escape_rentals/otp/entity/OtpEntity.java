package com.fullstack.escape_rentals.otp.entity;

import com.fullstack.escape_rentals.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "otp",
        indexes = {
                @Index(name = "idx_otp_email",
                        columnList = "email")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpEntity extends BaseEntity {
    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 6)
    private String otp;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Builder.Default
    @Column(nullable = false)
    private boolean verified = false;

    @Builder.Default
    @Column(nullable = false)
    private int failedAttempts = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OtpPurpose purpose;
}
