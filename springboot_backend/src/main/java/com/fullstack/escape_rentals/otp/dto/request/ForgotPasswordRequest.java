package com.fullstack.escape_rentals.otp.dto.request;

import com.fullstack.escape_rentals.otp.entity.OtpPurpose;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgotPasswordRequest {

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

}
