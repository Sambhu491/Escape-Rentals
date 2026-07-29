package com.fullstack.escape_rentals.auth.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String role;
}
