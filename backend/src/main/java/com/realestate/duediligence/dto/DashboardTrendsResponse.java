package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Week-over-week trend deltas for KPI cards.
 *
 * "This week"     = last 7 days
 * "Previous week" = 8 to 14 days ago
 *
 * Growth percent capped at ±999 to avoid infinities when previous = 0.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardTrendsResponse {

    private long propertiesThisWeek;
    private long propertiesLastWeek;
    private int propertiesGrowthPct;

    private long verifiedThisWeek;
    private long verifiedLastWeek;
    private int verifiedGrowthPct;

    private long newUsersThisWeek;
    private long newUsersLastWeek;
    private int usersGrowthPct;
}