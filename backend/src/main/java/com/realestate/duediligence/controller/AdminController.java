package com.realestate.duediligence.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * AdminController — endpoints only accessible by users with ROLE_ADMIN.
 *
 * Security:
 * - Class-level @PreAuthorize enforces ADMIN role on ALL methods
 * - Backed by SecurityConfig's /api/admin/** rule (defence in depth)
 * - Any non-admin user gets 403 Forbidden
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // ← protects EVERY method in this controller
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Welcome to the admin dashboard",
                "totalUsers", userRepository.count()));
    }
}