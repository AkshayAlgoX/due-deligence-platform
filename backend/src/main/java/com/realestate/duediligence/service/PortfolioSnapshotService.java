package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.dto.PortfolioHistoryPoint;

public interface PortfolioSnapshotService {

    /** Called by cron at midnight — snapshots every user + platform. */
    void takeDailySnapshots();

    /**
     * Called on every property add / update / delete.
     * Re-snapshots today for the affected user + refreshes platform snapshot.
     */
    void refreshSnapshotForUser(Long userId);

    /** Returns snapshot history for a user over the last N days. */
    List<PortfolioHistoryPoint> getHistoryForUser(Long userId, int days);

    /** Returns platform-wide snapshot history over the last N days (admin). */
    List<PortfolioHistoryPoint> getPlatformHistory(int days);
}