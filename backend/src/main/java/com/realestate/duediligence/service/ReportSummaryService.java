package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.AiSummaryResponse;

public interface ReportSummaryService {

    /**
     * Get AI summary — returns cached version if available, generates otherwise.
     * @param reportId the report to summarize
     * @param userEmail the calling user (for authorization + logging)
     * @return the summary (from cache or freshly generated)
     */
    AiSummaryResponse getOrGenerate(Long reportId, String userEmail);

    /**
     * Force regenerate — deletes cached summary and creates new one.
     * Rate-limited to once per 60 seconds per report.
     */
    AiSummaryResponse regenerate(Long reportId, String userEmail);
}