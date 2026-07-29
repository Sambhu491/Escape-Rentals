package com.fullstack.escape_rentals.otp.controller;

import com.fullstack.escape_rentals.auth.dto.response.AuthResponse;
import com.fullstack.escape_rentals.otp.dto.request.ResetPasswordRequest;
import com.fullstack.escape_rentals.otp.dto.request.VerifyOtpRequest;
import com.fullstack.escape_rentals.otp.dto.request.ForgotPasswordRequest;
import com.fullstack.escape_rentals.otp.dto.request.ResendOtpRequest;
import com.fullstack.escape_rentals.otp.dto.response.OtpResponse;
import com.fullstack.escape_rentals.otp.service.OtpService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "OTP Management")
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(otpService.verifyOtp(request));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<OtpResponse> resendOtp(
            @Valid @RequestBody ResendOtpRequest request) {

        return ResponseEntity.ok(otpService.resendOtp(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<OtpResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(otpService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<OtpResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ){
        return ResponseEntity.ok(
                otpService.resetPassword(request)
        );
    }

}
