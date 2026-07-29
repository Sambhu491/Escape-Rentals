package com.fullstack.escape_rentals.auth.serviceImpl;

import com.fullstack.escape_rentals.auth.dto.request.LoginRequest;
import com.fullstack.escape_rentals.auth.dto.request.RegisterRequest;
import com.fullstack.escape_rentals.auth.dto.response.AuthResponse;
import com.fullstack.escape_rentals.auth.entity.PendingRegistrationEntity;
import com.fullstack.escape_rentals.auth.repository.PendingRegistrationRepository;
import com.fullstack.escape_rentals.auth.service.AuthService;
import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.exception.DuplicateResourceException;
import com.fullstack.escape_rentals.exception.EmailNotVerifiedException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.otp.service.OtpService;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import com.fullstack.escape_rentals.security.JwtService;
import com.fullstack.escape_rentals.user.entity.Role;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import com.fullstack.escape_rentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final OtpService otpService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request){

        if(request.getRole() == Role.ROLE_ADMIN){

            throw new BadRequestException(
                    "Admin account cannot be created"
            );

        }
        if(pendingRegistrationRepository.existsByEmail(request.getEmail())){
            pendingRegistrationRepository.deleteByEmail(request.getEmail());
        }

        if(pendingRegistrationRepository.existsByPhone(request.getPhone())){
            pendingRegistrationRepository.deleteByPhone(request.getPhone());
        }



        if(userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }

        if(userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone already exists");
        }


        PendingRegistrationEntity pending =
                PendingRegistrationEntity.builder()
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .email(request.getEmail())
                        .phone(request.getPhone())
                        .password(passwordEncoder.encode(request.getPassword()))
                        .role(request.getRole() == null
                                ? Role.ROLE_USER
                                : request.getRole())
                        .build();

        pendingRegistrationRepository.save(pending);
        otpService.sendOtp(pending.getEmail());
        return AuthResponse.builder()
                .email(pending.getEmail())
                .firstName(pending.getFirstName())
                .lastName(pending.getLastName())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request){
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new ResourceNotFoundException("User not found"));

        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException("Please register");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );


        String token = jwtService.generateToken(
                new CustomUserDetails((user))
        );
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .build();
    }
}
















