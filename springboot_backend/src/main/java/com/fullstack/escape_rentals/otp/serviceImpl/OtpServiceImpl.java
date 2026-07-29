package com.fullstack.escape_rentals.otp.serviceImpl;

import com.fullstack.escape_rentals.auth.dto.response.AuthResponse;
import com.fullstack.escape_rentals.auth.entity.PendingRegistrationEntity;
import com.fullstack.escape_rentals.auth.repository.PendingRegistrationRepository;
import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.exception.DuplicateResourceException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.notification.service.NotificationService;
import com.fullstack.escape_rentals.otp.dto.request.ResetPasswordRequest;
import com.fullstack.escape_rentals.otp.dto.request.VerifyOtpRequest;
import com.fullstack.escape_rentals.otp.dto.request.ForgotPasswordRequest;
import com.fullstack.escape_rentals.otp.dto.request.ResendOtpRequest;
import com.fullstack.escape_rentals.otp.dto.response.OtpResponse;
import com.fullstack.escape_rentals.otp.entity.OtpEntity;
import com.fullstack.escape_rentals.otp.entity.OtpPurpose;
import com.fullstack.escape_rentals.otp.repository.OtpRepository;
import com.fullstack.escape_rentals.otp.service.OtpService;
import com.fullstack.escape_rentals.otp.util.OtpGenerator;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import com.fullstack.escape_rentals.security.JwtService;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import com.fullstack.escape_rentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final OtpRepository otpRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;
    private final PendingRegistrationRepository pendingRegistrationRepository;

    private static final int EXPIRY_MINUTES = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 60;

    private void createAndSendOtp(
            String email,
            String firstName,
            OtpPurpose purpose) {

        OtpEntity lastOtp = otpRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(email,purpose)
                .orElse(null);

        if (lastOtp != null && lastOtp.getCreatedAt() != null) {

            LocalDateTime allowedTime =
                    lastOtp.getCreatedAt().plusSeconds(RESEND_COOLDOWN_SECONDS);

            if (LocalDateTime.now().isBefore(allowedTime)) {

                long secondsLeft = Duration.between(
                        LocalDateTime.now(),
                        allowedTime
                ).getSeconds();

                throw new BadRequestException(
                        "Please wait " + Math.max(0, secondsLeft)
                                + " seconds before requesting another OTP."
                );
            }
        }

        PendingRegistrationEntity userRegister = pendingRegistrationRepository.findByEmail(email).orElse(null);
        UserEntity userEntity = userRepository.findByEmail(email).orElse(null);

        String userName = "";
        if(userRegister != null &&  userRegister.getFirstName() != null) {
            userName = userRegister.getFirstName();
        }
        if(userEntity != null && userEntity.getFirstName()!=null) {
            userName = userEntity.getFirstName();
        }

        otpRepository.deleteByEmailAndPurpose(email,purpose);

        String otp = OtpGenerator.generate();

        OtpEntity entity = OtpEntity.builder()
                .email(email)
                .otp(otp)
                .verified(false)
                .purpose(purpose)
                .expiresAt(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES))
                .build();

        otpRepository.save(entity);

        notificationService.sendOtpEmail(
                userName,
                email,
                otp
        );
    }


    @Override
    @Transactional
    public OtpResponse sendOtp(String email) {

        UserEntity user = userRepository.findByEmail(email).orElse(null);

        String firstName = user != null && user.getFirstName() != null
                ? user.getFirstName()
                : "Customer";

        createAndSendOtp(email, firstName,OtpPurpose.REGISTRATION);

        return OtpResponse.builder()
                .success(true)
                .message("OTP sent successfully")
                .build();
    }

    @Override
    @Transactional(noRollbackFor = BadRequestException.class)
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        OtpEntity otp = otpRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(
                        request.getEmail(),
                        OtpPurpose.REGISTRATION
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException("OTP not found")
                );
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP expired");
        }

        if (otp.isVerified()) {
            throw new BadRequestException("OTP already used");
        }

        int maxAttempts = 5;
        if (otp.getFailedAttempts() >= maxAttempts) {
            throw new BadRequestException(
                    "Too many attempts. Request a new OTP."
            );
        }

        if (!otp.getOtp().equals(request.getOtpCode())) {
            int failedAttempts = otp.getFailedAttempts() + 1;
            otp.setFailedAttempts(failedAttempts);
            otpRepository.save(otp);

            int remainingAttempts = maxAttempts - failedAttempts;
            if (remainingAttempts <= 0) {
                throw new BadRequestException(
                        "Invalid OTP. Maximum attempts exceeded."
                );
            }
            throw new BadRequestException(
                    "Invalid OTP. " + remainingAttempts + " attempts left."
            );
        }

        // OTP SUCCESS
        otp.setVerified(true);
        otp.setFailedAttempts(0);
        otpRepository.save(otp);

        PendingRegistrationEntity pending =
                pendingRegistrationRepository.findByEmail(request.getEmail())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Registration not found"
                                )
                        );
        if(userRepository.existsByEmail(pending.getEmail())){
            throw new DuplicateResourceException(
                    "Email already registered"
            );
        }

        UserEntity user = UserEntity.builder()
                .firstName(pending.getFirstName())
                .lastName(pending.getLastName())
                .email(pending.getEmail())
                .phone(pending.getPhone())
                .password(pending.getPassword())
                .role(pending.getRole())
                .emailVerified(true)
                .enabled(true)
                .build();
        UserEntity savedUser = userRepository.save(user);

        // remove temporary registration data
        pendingRegistrationRepository.deleteByEmail(
                request.getEmail()
        );

        otpRepository.deleteByEmailAndPurpose(
                request.getEmail(),
                OtpPurpose.REGISTRATION
        );


        String token = jwtService.generateToken(
                new CustomUserDetails(savedUser)
        );

        return AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .email(savedUser.getEmail())
                .phone(savedUser.getPhone())
                .role(savedUser.getRole().name())
                .build();
    }


    @Override
    @Transactional
    public OtpResponse resendOtp(ResendOtpRequest request) {
        if (request.getPurpose() == OtpPurpose.REGISTRATION) {
            PendingRegistrationEntity pending =
                    pendingRegistrationRepository
                            .findByEmail(request.getEmail())
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Registration not found"
                                    )
                            );
            createAndSendOtp(
                    pending.getEmail(),
                    pending.getFirstName(),
                    OtpPurpose.REGISTRATION
            );
        } else if (request.getPurpose() == OtpPurpose.PASSWORD_RESET) {
            UserEntity user =
                    userRepository.findByEmail(request.getEmail())
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "User not found"
                                    )
                            );
            createAndSendOtp(
                    user.getEmail(),
                    user.getFirstName(),
                    OtpPurpose.PASSWORD_RESET
            );
        }
        return OtpResponse.builder()
                .success(true)
                .message("OTP resent successfully")
                .build();
    }


    @Override
    @Transactional
    public OtpResponse forgotPassword(ForgotPasswordRequest request) {

        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isEmailVerified()) {
            throw new BadRequestException("Please verify your email first.");
        }

        createAndSendOtp(
                user.getEmail(),
                user.getFirstName(),
                OtpPurpose.PASSWORD_RESET
        );

        return OtpResponse.builder()
                .success(true)
                .message("Password reset OTP sent successfully")
                .build();
    }

    @Override
    @Transactional
    public OtpResponse resetPassword(ResetPasswordRequest request) {

        OtpEntity otp = otpRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(
                        request.getEmail(),
                        OtpPurpose.PASSWORD_RESET
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException("OTP not found")
                );

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP expired");
        }

        if (otp.isVerified()) {
            throw new BadRequestException("OTP already used");
        }

        int maxAttempts = 5;
        if(otp.getFailedAttempts() >= maxAttempts) {
            throw new BadRequestException(
                    "Too many attempts. Request a new OTP."
            );
        }

        if (!otp.getOtp().equals(request.getOtpCode())) {

            int failedAttempts = otp.getFailedAttempts() + 1;

            otp.setFailedAttempts(failedAttempts);
            otpRepository.save(otp);

            int remainingAttempts = maxAttempts - failedAttempts;

            if (remainingAttempts <= 0) {
                throw new BadRequestException(
                        "Too many invalid attempts. Please request a new OTP."
                );
            }

            throw new BadRequestException(
                    "Invalid OTP. " + remainingAttempts + " attempts left."
            );
        }

        UserEntity user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        user.setPassword(
                passwordEncoder.encode(request.getNewPassword())
        );

        userRepository.save(user);

        otp.setVerified(true);
        otpRepository.save(otp);

        return OtpResponse.builder()
                .success(true)
                .message("Password reset successfully")
                .build();
    }

}





















