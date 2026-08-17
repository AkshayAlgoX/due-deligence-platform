package com.realestate.duediligence.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import com.realestate.duediligence.dto.SystemHealthDto;
import com.realestate.duediligence.dto.UpdateUserRoleRequest;
import com.realestate.duediligence.dto.UserManagementDto;
import com.realestate.duediligence.service.AdminAnalyticsService;
import com.realestate.duediligence.service.SystemHealthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin — User Management & System Health",
        description = "Admin endpoints for user management (list, role change, ban/unban) " +
                "and system health monitoring. All require ROLE_ADMIN.")
public class UserManagementController {

    private final AdminAnalyticsService adminAnalyticsService;
    private final SystemHealthService systemHealthService;

    @Autowired
    public UserManagementController(AdminAnalyticsService adminAnalyticsService,
            SystemHealthService systemHealthService) {
        this.adminAnalyticsService = adminAnalyticsService;
        this.systemHealthService = systemHealthService;
    }

    @GetMapping("/users")
    @Operation(
            summary = "List all users (paginated + filterable)",
            description = "Returns a paginated list of all platform users. " +
                    "Supports filtering by name/email search and by role.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paginated user list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN")
    })
    public Page<UserManagementDto> listUsers(
            @Parameter(description = "Page number (0-based)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Search term (matches full name or email, case-insensitive)") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by role (BUYER, REAL_ESTATE_AGENT, ADMIN, etc.)") @RequestParam(required = false) String role) {
        return adminAnalyticsService.listUsers(search, role, page, size);
    }

    @GetMapping("/users/{userId}")
    @Operation(
            summary = "Get a user by ID",
            description = "Returns the full management profile for a single user.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public UserManagementDto getUser(
            @Parameter(description = "User ID", required = true) @PathVariable Long userId) {
        return adminAnalyticsService.getUserById(userId);
    }

    @PutMapping("/users/{userId}/role")
    @Operation(
            summary = "Change a user's role",
            description = "Updates the platform role for the specified user. " +
                    "Valid roles: BUYER, REAL_ESTATE_AGENT, LEGAL_REVIEWER, FINANCIAL_INSTITUTION, ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Role updated — updated user DTO returned"),
            @ApiResponse(responseCode = "400", description = "Invalid role value"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public UserManagementDto updateUserRole(
            @Parameter(description = "User ID", required = true) @PathVariable Long userId,
            @RequestBody UpdateUserRoleRequest request) {
        return adminAnalyticsService.updateUserRole(userId, request.getRole());
    }

    @PutMapping("/users/{userId}/ban")
    @Operation(
            summary = "Ban a user",
            description = "Sets isBanned=true for the user, preventing future logins. " +
                    "Already-issued JWTs remain valid until expiry unless /logout-all-devices is called.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User banned — updated DTO returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public UserManagementDto banUser(
            @Parameter(description = "User ID to ban", required = true) @PathVariable Long userId) {
        return adminAnalyticsService.banUser(userId);
    }

    @PutMapping("/users/{userId}/unban")
    @Operation(
            summary = "Unban a user",
            description = "Sets isBanned=false for the user, restoring login access.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User unbanned — updated DTO returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public UserManagementDto unbanUser(
            @Parameter(description = "User ID to unban", required = true) @PathVariable Long userId) {
        return adminAnalyticsService.unbanUser(userId);
    }

    @GetMapping("/system/health")
    @Operation(
            summary = "Get system health status",
            description = "Returns the live status of the API server and database connection, " +
                    "plus application uptime in seconds. Used by the Admin System Health page.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Health status returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN")
    })
    public SystemHealthDto getSystemHealth() {
        return systemHealthService.getSystemHealth();
    }
}
