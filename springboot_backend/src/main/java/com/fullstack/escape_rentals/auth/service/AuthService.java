package com.fullstack.escape_rentals.auth.service;

import com.fullstack.escape_rentals.auth.dto.request.LoginRequest;
import com.fullstack.escape_rentals.auth.dto.request.RegisterRequest;
import com.fullstack.escape_rentals.auth.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
