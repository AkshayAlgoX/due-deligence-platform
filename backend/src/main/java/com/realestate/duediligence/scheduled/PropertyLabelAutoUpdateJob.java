package com.realestate.duediligence.scheduled;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.realestate.duediligence.service.PropertyLabelService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class PropertyLabelAutoUpdateJob {

    private final PropertyLabelService labelService;

    /**
     * Runs every hour - recalculates auto labels for all properties.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void recalculateAutoLabels() {
        log.info("[LabelAutoUpdate] Starting hourly recalculation...");
        try {
            int count = labelService.recalculateAllAutoLabels();
            log.info("[LabelAutoUpdate] Completed: {} properties processed", count);
        } catch (Exception e) {
            log.error("[LabelAutoUpdate] Failed: {}", e.getMessage(), e);
        }
    }

    /**
     * Runs every 15 minutes - cleans up expired labels.
     */
    @Scheduled(cron = "0 */15 * * * *")
    public void cleanupExpiredLabels() {
        try {
            int deleted = labelService.cleanupExpiredLabels();
            if (deleted > 0) {
                log.info("[LabelCleanup] Removed {} expired labels", deleted);
            }
        } catch (Exception e) {
            log.error("[LabelCleanup] Failed: {}", e.getMessage(), e);
        }
    }
}