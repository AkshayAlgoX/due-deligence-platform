package com.realestate.duediligence.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.SystemHealthDto;
import com.realestate.duediligence.dto.UpdateUserRoleRequest;
import com.realestate.duediligence.dto.UserManagementDto;
import com.realestate.duediligence.service.AdminAnalyticsService;
import com.realestate.duediligence.service.SystemHealthService;

@RestController
@RequestMapping("/api/admin")
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
    public Page<UserManagementDto> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        return adminAnalyticsService.listUsers(search, role, page, size);
    }

    @GetMapping("/users/{userId}")
    public UserManagementDto getUser(@PathVariable Long userId) {
        return adminAnalyticsService.getUserById(userId);
    }

    @PutMapping("/users/{userId}/role")
    public UserManagementDto updateUserRole(@PathVariable Long userId,
            @RequestBody UpdateUserRoleRequest request) {
        return adminAnalyticsService.updateUserRole(userId, request.getRole());
    }

    @PutMapping("/users/{userId}/ban")
    public UserManagementDto banUser(@PathVariable Long userId) {
        return adminAnalyticsService.banUser(userId);
    }

    @PutMapping("/users/{userId}/unban")
    public UserManagementDto unbanUser(@PathVariable Long userId) {
        return adminAnalyticsService.unbanUser(userId);
    }

    @GetMapping("/system/health")
    public SystemHealthDto getSystemHealth() {
        return systemHealthService.getSystemHealth();
    }
}