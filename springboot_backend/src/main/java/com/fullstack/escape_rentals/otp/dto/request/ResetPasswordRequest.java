package com.fullstack.escape_rentals.otp.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {


    @Email(message="Please provide a valid email address")
    @NotBlank(message="Email is required")
    @Size(max = 300, message = "Email cannot exceed 300 characters")
    private String email;


    @NotBlank(message = "OTP code is required")
    @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
    private String otpCode;


    @NotBlank(message="Password is required")
    @Size(min=6,message = "Password must be minimum 6 characters")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String newPassword;
}
