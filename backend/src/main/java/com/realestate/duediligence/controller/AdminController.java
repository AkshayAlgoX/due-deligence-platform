package com.realestate.duediligence.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only utility endpoints. All require ROLE_ADMIN.")
public class AdminController {

    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    @Operation(
            summary = "Admin dashboard summary",
            description = "Returns a simple admin welcome payload including the total user count. " +
                    "Requires ROLE_ADMIN. Use /api/admin/dashboard/* for full analytics.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Summary returned successfully"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN")
    })
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Welcome to the admin dashboard",
                "totalUsers", userRepository.count()));
    }
}
