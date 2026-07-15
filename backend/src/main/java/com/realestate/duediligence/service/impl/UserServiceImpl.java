package com.realestate.duediligence.service.impl;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.ApiResponse;
import com.realestate.duediligence.dto.AuthResponse;
import com.realestate.duediligence.dto.LoginRequest;
import com.realestate.duediligence.dto.RegisterRequest;
import com.realestate.duediligence.entity.Role;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.RoleRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.UserService;
import com.realestate.duediligence.util.JwtService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    public ApiResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return new ApiResponse(false, "Email already exists");
        }

        Role role = roleRepository.findByRoleName(request.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        return new ApiResponse(true, "User registered successfully");
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        String token = jwtService.generateToken(request.getEmail());

        return new AuthResponse(token);
    }
}