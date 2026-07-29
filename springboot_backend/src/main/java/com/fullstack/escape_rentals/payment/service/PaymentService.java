package com.fullstack.escape_rentals.payment.service;

import com.fullstack.escape_rentals.payment.dto.request.VerifyPaymentRequest;
import com.fullstack.escape_rentals.payment.dto.response.CreateOrderResponse;
import com.fullstack.escape_rentals.payment.dto.response.PaymentResponse;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentService {

    CreateOrderResponse createOrder(Long bookingId,CustomUserDetails currentUser);
    void verifyPayment(VerifyPaymentRequest request,CustomUserDetails currentUser);
    PaymentResponse getPaymentByBooking(Long bookingId, CustomUserDetails currentUser);
    Page<PaymentResponse> getPayments(Pageable pageable);
    void handleWebhook(String payload, String signature);
}
