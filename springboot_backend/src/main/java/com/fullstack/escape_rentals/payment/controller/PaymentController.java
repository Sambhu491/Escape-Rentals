package com.fullstack.escape_rentals.payment.controller;

import com.fullstack.escape_rentals.payment.dto.request.VerifyPaymentRequest;
import com.fullstack.escape_rentals.payment.dto.response.CreateOrderResponse;
import com.fullstack.escape_rentals.payment.dto.response.PaymentResponse;
import com.fullstack.escape_rentals.payment.service.PaymentService;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Management")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/order/{bookingId}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<CreateOrderResponse> createOrder(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {

        return ResponseEntity.ok(
                paymentService.createOrder(bookingId,currentUser)
        );
    }

    @PostMapping("/verify")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<Void> verifyPayment(
            @RequestBody @Valid VerifyPaymentRequest request,
            @AuthenticationPrincipal CustomUserDetails currentUser
            ) {

        paymentService.verifyPayment(request,currentUser);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{bookingId}")
    @PreAuthorize("hasAnyRole('USER','HOST','ADMIN')")
    public ResponseEntity<PaymentResponse> getPayment(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal CustomUserDetails user
    ){
        return ResponseEntity.ok(
                paymentService.getPaymentByBooking(
                        bookingId,
                        user
                )
        );
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PaymentResponse>> getPayments(
            Pageable pageable
    ){
        return ResponseEntity.ok(
                paymentService.getPayments(pageable)
        );
    }

}
