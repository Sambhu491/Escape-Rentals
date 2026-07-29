package com.fullstack.escape_rentals.payment.entity;

import com.fullstack.escape_rentals.booking.entity.BookingEntity;
import com.fullstack.escape_rentals.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;


@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentEntity extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String razorpayOrderId;

    private String razorpayPaymentId;

    @Column(length = 500)
    private String razorpaySignature;

    @Column(nullable = false)
    private Long amount; // paise

    @Column(nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private BookingEntity booking;
}
