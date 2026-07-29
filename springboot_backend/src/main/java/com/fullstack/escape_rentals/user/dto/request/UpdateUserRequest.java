package com.fullstack.escape_rentals.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name cannot exceed 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name cannot exceed 50 characters")
    private String lastName;

    @NotBlank(message = "Mobile number is required")
    @Size(max = 20, message = "Mobile number cannot exceed 20 characters")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 300, message = "Email cannot exceed 300 characters")
    private String email;

    @Size(min = 8, max = 255,
            message = "Password must be between 8 and 255 characters")
    private String newPassword;
}
