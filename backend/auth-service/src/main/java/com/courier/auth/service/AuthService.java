package com.courier.auth.service;

import com.courier.auth.dto.AuthResponse;
import com.courier.auth.dto.LoginRequest;
import com.courier.auth.dto.RegisterRequest;
import com.courier.auth.entity.User;
import com.courier.auth.repository.UserRepository;
import com.courier.auth.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.courier.auth.dto.UserDto;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final AuthenticationManager authenticationManager;

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

        var token = jwtProvider.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        var userDto = new UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getRole().name());
        return new AuthResponse(token, userDto);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        var user = userRepository.findByEmail(request.email())
                .orElseThrow();
        
        var token = jwtProvider.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        var userDto = new UserDto(user.getId(), user.getEmail(), user.getFullName(), user.getRole().name());
        return new AuthResponse(token, userDto);
    }
}
