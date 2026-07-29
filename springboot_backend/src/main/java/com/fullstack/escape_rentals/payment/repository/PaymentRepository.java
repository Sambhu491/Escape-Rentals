package com.fullstack.escape_rentals.payment.repository;

import com.fullstack.escape_rentals.payment.entity.PaymentEntity;
import com.fullstack.escape_rentals.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<PaymentEntity,Long> {
    Optional<PaymentEntity> findByRazorpayOrderId(String razorpayOrderId);
    Optional<PaymentEntity> findByBookingId(Long bookingId);

    Long countByStatus(PaymentStatus paymentStatus);
}
