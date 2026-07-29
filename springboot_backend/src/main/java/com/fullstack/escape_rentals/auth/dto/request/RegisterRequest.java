package com.fullstack.escape_rentals.auth.dto.request;

import com.fullstack.escape_rentals.user.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message="First name is required")
    @Size(max = 50, message = "First name cannot exceed 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name cannot exceed 50 characters")
    private String lastName;

    @Email(message="Please provide a valid email address")
    @NotBlank(message="Email is required")
    @Size(max = 300, message = "Email cannot exceed 300 characters")
    private String email;

    @NotBlank(message="Password is required")
    @Size(min=6,message = "Password must be minimum 6 characters")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    @NotBlank(message = "Mobile number is required")
    @Size(max = 20, message = "Mobile number cannot exceed 20 characters")
    private String phone;

    @NotNull(message="Role is required")
    private Role role;
}
