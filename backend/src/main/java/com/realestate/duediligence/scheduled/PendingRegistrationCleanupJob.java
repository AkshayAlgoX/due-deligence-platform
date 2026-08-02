package com.realestate.duediligence.scheduled;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.realestate.duediligence.repository.PendingRegistrationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Scheduled cleanup job for abandoned pending registrations.
 *
 * Any PendingRegistration row older than 24 hours is deleted, whether or not
 * it was ever verified. This keeps the table small and removes stale
 * BCrypt-hashed password data from abandoned signup attempts.
 *
 * Runs every hour at minute 15 (offset avoids clustering with other jobs).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PendingRegistrationCleanupJob {

    private static final int TTL_HOURS = 24;

    private final PendingRegistrationRepository pendingRepo;

    /**
     * Cron: every hour at :15 → 00:15, 01:15, 02:15, ...
     */
    @Scheduled(cron = "0 15 * * * *")
    public void cleanupExpiredPendingRegistrations() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(TTL_HOURS);
        int deleted = pendingRepo.deleteExpiredBefore(cutoff);
        if (deleted > 0) {
            log.info("Pending registration cleanup — deleted {} row(s) older than {}h",
                    deleted, TTL_HOURS);
        }
    }
}