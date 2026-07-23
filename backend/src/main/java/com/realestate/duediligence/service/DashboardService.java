package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.dto.ActivityItemResponse;
import com.realestate.duediligence.dto.DashboardStatsResponse;
import com.realestate.duediligence.dto.DashboardTrendsResponse;
import com.realestate.duediligence.dto.PortfolioInsightsResponse;
import com.realestate.duediligence.dto.RecommendationResponse;

public interface DashboardService {

    DashboardStatsResponse getStats();

    /** Portfolio-level analytics: total value, distributions, top city. */
    PortfolioInsightsResponse getPortfolioInsights();

    /** Recent activity feed derived from property state. */
    List<ActivityItemResponse> getRecentActivity(int limit);

    /** Week-over-week trend deltas. */
    DashboardTrendsResponse getTrends();

    /** Rule-based recommendations derived from real portfolio data. */
    List<RecommendationResponse> getRecommendations();
}