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
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.AdminAnalyticsService;

@Service
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    @Autowired
    public AdminAnalyticsServiceImpl(UserRepository userRepository,
            PropertyRepository propertyRepository) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
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