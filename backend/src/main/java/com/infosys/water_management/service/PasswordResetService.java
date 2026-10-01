package com.infosys.water_management.service;

import com.infosys.water_management.model.PasswordResetOtp;
import com.infosys.water_management.model.User;
import com.infosys.water_management.repository.PasswordResetOtpRepository;
import com.infosys.water_management.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PasswordResetService {

    private static final Logger logger = LoggerFactory.getLogger(PasswordResetService.class);

    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetService(
            PasswordResetOtpRepository passwordResetOtpRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.passwordResetOtpRepository = passwordResetOtpRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public String requestOtp(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return "If this email is registered, an OTP has been sent.";
        }

        try {
            passwordResetOtpRepository.deleteByEmail(email);
        } catch (Exception e) {
            logger.warn("Could not delete prior OTP for email {}", email, e);
        }

        String otp = String.format("%06d", secureRandom.nextInt(1000000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

        PasswordResetOtp otpEntity = PasswordResetOtp.builder()
                .email(email)
                .otp(otp)
                .expiresAt(expiresAt)
                .used(false)
                .createdAt(LocalDateTime.now())
                .build();

        passwordResetOtpRepository.save(otpEntity);

        try {
            String subject = "HydroFlow - Password Reset OTP";
            String body = String.format("Your OTP is: %s\nValid for 10 minutes. Do not share this with anyone.", otp);
            emailService.sendSimpleEmail(email, subject, body);
        } catch (Exception e) {
            logger.error("Failed to send password reset OTP email to {}", email, e);
        }

        return "If this email is registered, an OTP has been sent.";
    }

    @Transactional
    public String verifyOtpAndResetPassword(String email, String otp, String newPassword) {
        PasswordResetOtp otpEntity = passwordResetOtpRepository.findByEmailAndUsedFalse(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid OTP or no active OTP request found."));

        if (!otpEntity.getOtp().equals(otp.trim())) {
            throw new IllegalArgumentException("Invalid OTP code.");
        }

        if (otpEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP expired. Please request a new OTP.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User account not found for email: " + email));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        otpEntity.setUsed(true);
        passwordResetOtpRepository.save(otpEntity);

        return "Password reset successfully. Please login.";
    }
}
