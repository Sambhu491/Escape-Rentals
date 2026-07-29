package com.fullstack.escape_rentals.payment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class VerifyPaymentRequest {

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;
}
