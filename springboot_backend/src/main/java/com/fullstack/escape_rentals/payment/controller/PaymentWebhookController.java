package com.fullstack.escape_rentals.payment.controller;

import com.fullstack.escape_rentals.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Webhook Management")
public class PaymentWebhookController {
    private final PaymentService paymentService;

    @PostMapping("/webhook/razorpay")
    public ResponseEntity<Void> razorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature
    ){
        paymentService.handleWebhook(
                payload,
                signature
        );
        return ResponseEntity.ok().build();
    }
}
