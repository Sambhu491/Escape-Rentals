package com.fullstack.escape_rentals.otp.service;

import com.fullstack.escape_rentals.auth.dto.response.AuthResponse;
import com.fullstack.escape_rentals.otp.dto.request.ResetPasswordRequest;
import com.fullstack.escape_rentals.otp.dto.request.VerifyOtpRequest;
import com.fullstack.escape_rentals.otp.dto.request.ForgotPasswordRequest;
import com.fullstack.escape_rentals.otp.dto.request.ResendOtpRequest;
import com.fullstack.escape_rentals.otp.dto.response.OtpResponse;

public interface OtpService {
    OtpResponse sendOtp(String email);
    AuthResponse verifyOtp(VerifyOtpRequest request);
    OtpResponse resendOtp(ResendOtpRequest request);
    OtpResponse forgotPassword(ForgotPasswordRequest request);
    OtpResponse resetPassword(ResetPasswordRequest request);
}
