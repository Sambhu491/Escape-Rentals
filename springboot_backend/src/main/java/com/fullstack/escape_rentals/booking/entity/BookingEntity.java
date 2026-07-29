package com.fullstack.escape_rentals.booking.entity;

import com.fullstack.escape_rentals.common.entity.BaseEntity;
import com.fullstack.escape_rentals.payment.entity.PaymentEntity;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private PropertyEntity property;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "guest_id", nullable = false)
    private UserEntity guest;

    @Column(nullable = false)
    private LocalDate checkInDate;

    @Column(nullable = false)
    private LocalDate checkOutDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(nullable = false)
    @Builder.Default
    private Integer guestCount = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "payment_deadline", columnDefinition = "TIMESTAMP")
    private LocalDateTime paymentDeadline;

    @OneToOne(
            mappedBy = "booking",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private PaymentEntity payment;


}
