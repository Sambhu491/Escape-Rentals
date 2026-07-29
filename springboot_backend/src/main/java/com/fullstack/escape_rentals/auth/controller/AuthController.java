package com.fullstack.escape_rentals.auth.controller;

import com.fullstack.escape_rentals.auth.dto.request.LoginRequest;
import com.fullstack.escape_rentals.auth.dto.request.RegisterRequest;
import com.fullstack.escape_rentals.auth.dto.response.AuthResponse;
import com.fullstack.escape_rentals.auth.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Auth Management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {

//        ResponseCookie cookie = ResponseCookie.from("token", authResponse.getToken())
//                .httpOnly(true)
//                .secure(false)
//                .sameSite("Lax")
//                .path("/")
//                .maxAge(Duration.ofDays(1))
//                .build();
//
//        return ResponseEntity.ok()
//                .header(HttpHeaders.SET_COOKIE, cookie.toString())
//                .body(authResponse);

        return ResponseEntity.ok(authService.login(request));
    }
}
