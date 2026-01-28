package com.courier.auth.service;

import com.courier.auth.dto.*;
import com.courier.auth.entity.PasswordResetToken;
import com.courier.auth.entity.User;
import com.courier.auth.repository.PasswordResetTokenRepository;
import com.courier.auth.repository.UserRepository;
import com.courier.auth.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already in use");
        }

        var user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .build();

        userRepository.save(user);

        var token = jwtProvider.generateToken(user.getEmail(), user.getId(), user.getRole().name(), user.getFullName());
        return new AuthResponse(token, mapToUserDto(user));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        var user = userRepository.findByEmail(request.email())
                .orElseThrow();
        
        var token = jwtProvider.generateToken(user.getEmail(), user.getId(), user.getRole().name(), user.getFullName());
        return new AuthResponse(token, mapToUserDto(user));
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if token exists and remove it? Or just create new one?
        // Let's remove old one if exists
        passwordResetTokenRepository.findByUser(user).ifPresent(passwordResetTokenRepository::delete);

        String token = UUID.randomUUID().toString();
        var resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();

        passwordResetTokenRepository.save(resetToken);
        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    public void resetPassword(ResetPasswordRequest request) {
        var resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new RuntimeException("Token expired");
        }

        var user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        passwordResetTokenRepository.delete(resetToken);
    }

    public void logout(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            try {
                long remainingTime = jwtProvider.getRemainingTime(token);
                if (remainingTime > 0) {
                    tokenBlacklistService.blacklistToken(token, remainingTime);
                }
            } catch (Exception e) {
                // Token invalid or expired, no need to blacklist
            }
        }
    }

    public UserDto getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserDto(user);
    }

    public UserDto updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.fullName() != null) user.setFullName(request.fullName());
        if (request.phone() != null) user.setPhone(request.phone());
        if (request.emailNotifications() != null) user.setEmailNotifications(request.emailNotifications());
        if (request.smsNotifications() != null) user.setSmsNotifications(request.smsNotifications());
        if (request.pushNotifications() != null) user.setPushNotifications(request.pushNotifications());
        if (request.defaultLatitude() != null) user.setDefaultLatitude(request.defaultLatitude());
        if (request.defaultLongitude() != null) user.setDefaultLongitude(request.defaultLongitude());
        if (request.defaultCity() != null) user.setDefaultCity(request.defaultCity());
        if (request.theme() != null) {
            try {
                user.setTheme(User.Theme.valueOf(request.theme().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Ignore invalid theme or set default
            }
        }
        
        userRepository.save(user);
        return mapToUserDto(user);
    }

    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new RuntimeException("New passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    private UserDto mapToUserDto(User user) {
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name(),
            user.getPhone(),
            user.isEmailNotifications(),
            user.isSmsNotifications(),
            user.isPushNotifications(),
            user.getDefaultLatitude(),
            user.getDefaultLongitude(),
            user.getDefaultCity(),
            user.getTheme() != null ? user.getTheme().name() : "LIGHT"
        );
    }
}