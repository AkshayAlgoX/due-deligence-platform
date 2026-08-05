package com.realestate.duediligence.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.CityActivityDto;
import com.realestate.duediligence.dto.DashboardStatsDto;
import com.realestate.duediligence.dto.MonthlyTrendDto;
import com.realestate.duediligence.dto.RiskDistributionDto;
import com.realestate.duediligence.dto.UserActivityDto;
import com.realestate.duediligence.dto.UserManagementDto;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.AdminAnalyticsService;

@Service
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final com.realestate.duediligence.repository.RoleRepository roleRepository;

    @Autowired
    public AdminAnalyticsServiceImpl(UserRepository userRepository,
            PropertyRepository propertyRepository,
            com.realestate.duediligence.repository.RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public org.springframework.data.domain.Page<UserManagementDto> listUsers(String search, String role, int page,
            int size) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.toLowerCase();
        com.realestate.duediligence.enums.RoleType roleType = null;
        if (role != null && !role.isBlank()) {
            roleType = com.realestate.duediligence.enums.RoleType.valueOf(role.toUpperCase());
        }

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);

        return userRepository.searchUsers(normalizedSearch, roleType, pageable)
                .map(this::toUserManagementDto);
    }

    @Override
    public UserManagementDto getUserById(Long userId) {
        com.realestate.duediligence.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        return toUserManagementDto(user);
    }

    @Override
    public UserManagementDto updateUserRole(Long userId, String newRole) {
        com.realestate.duediligence.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        com.realestate.duediligence.enums.RoleType roleType = com.realestate.duediligence.enums.RoleType
                .valueOf(newRole.toUpperCase());

        com.realestate.duediligence.entity.Role role = roleRepository.findByRoleName(roleType)
                .orElseThrow(() -> new RuntimeException("Role not found: " + newRole));

        user.setRole(role);
        userRepository.save(user);
        return toUserManagementDto(user);
    }

    @Override
    public UserManagementDto banUser(Long userId) {
        com.realestate.duediligence.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setIsBanned(true);
        userRepository.save(user);
        return toUserManagementDto(user);
    }

    @Override
    public UserManagementDto unbanUser(Long userId) {
        com.realestate.duediligence.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setIsBanned(false);
        userRepository.save(user);
        return toUserManagementDto(user);
    }

    private UserManagementDto toUserManagementDto(com.realestate.duediligence.entity.User user) {
        return new UserManagementDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().getRoleName().name() : null,
                user.getIsActive(),
                user.getIsBanned(),
                user.getCreatedAt());
    }

    @Override
    public DashboardStatsDto getStats(int periodDays) {
        long totalUsers = userRepository.count();
        long totalProperties = propertyRepository.count();

        LocalDateTime periodStart = LocalDateTime.now().minusDays(periodDays);
        LocalDateTime previousPeriodStart = periodStart.minusDays(periodDays);

        long newUsersThisPeriod = userRepository.countByCreatedAtBetween(periodStart, LocalDateTime.now());
        long newUsersPreviousPeriod = userRepository.countByCreatedAtBetween(previousPeriodStart, periodStart);
        double userTrendPercent = calculateTrendPercent(newUsersPreviousPeriod, newUsersThisPeriod);

        long newPropsThisPeriod = propertyRepository.countByCreatedAtBetween(periodStart, LocalDateTime.now());
        long newPropsPreviousPeriod = propertyRepository.countByCreatedAtBetween(previousPeriodStart, periodStart);
        double propertyTrendPercent = calculateTrendPercent(newPropsPreviousPeriod, newPropsThisPeriod);

        long reportsThisMonth = 0;
        double avgRiskScore = 0.0;

        return new DashboardStatsDto(
                totalUsers,
                totalProperties,
                reportsThisMonth,
                avgRiskScore,
                userTrendPercent,
                propertyTrendPercent);
    }

    @Override
    public List<CityActivityDto> getTopCities(int limit) {
        List<Object[]> rows = propertyRepository.aggregateByCity();
        List<CityActivityDto> result = new ArrayList<>();

        for (Object[] row : rows) {
            if (result.size() >= limit)
                break;
            String city = (String) row[0];
            long count = (Long) row[1];
            result.add(new CityActivityDto(city, count));
        }
        return result;
    }

    @Override
    public long getActiveUsers(int periodDays) {
        LocalDateTime since = LocalDateTime.now().minusDays(periodDays);
        return userRepository.countActiveUsersSince(since);
    }

    @Override
    public List<RiskDistributionDto> getRiskDistribution(int periodDays) {
        return List.of(
                new RiskDistributionDto("LOW", 0),
                new RiskDistributionDto("MEDIUM", 0),
                new RiskDistributionDto("HIGH", 0),
                new RiskDistributionDto("CRITICAL", 0));
    }

    @Override
    public List<MonthlyTrendDto> getReportsTrend(int periodDays, String granularity) {
        return List.of();
    }

    @Override
    public List<UserActivityDto> getUserActivityHeatmap() {
        List<Object[]> rows = userRepository.getUserActivityHeatmapRaw();
        List<UserActivityDto> result = new ArrayList<>();

        for (Object[] row : rows) {
            int dayOfWeek = ((Number) row[0]).intValue();
            int hourOfDay = ((Number) row[1]).intValue();
            long count = ((Number) row[2]).longValue();
            result.add(new UserActivityDto(dayOfWeek, hourOfDay, count));
        }
        return result;
    }

    private double calculateTrendPercent(long previous, long current) {
        if (previous == 0) {
            return current == 0 ? 0.0 : 100.0;
        }
        return ((double) (current - previous) / previous) * 100.0;
    }
}