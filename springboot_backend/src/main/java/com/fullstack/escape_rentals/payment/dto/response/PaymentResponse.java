package com.fullstack.escape_rentals.payment.dto.response;

import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import com.fullstack.escape_rentals.payment.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentResponse {
    private Long paymentId;
    private Long bookingId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private Long amount;
    private String currency;
    private PaymentStatus status;
    private LocalDateTime createdAt;

    // Added so the admin payments table can show who/what a payment belongs to
    // without a separate lookup — previously only the raw bookingId was exposed.
    private BookingStatus bookingStatus;
    private String propertyTitle;
    private String guestName;
    private String guestEmail;
    private String hostName;
}
