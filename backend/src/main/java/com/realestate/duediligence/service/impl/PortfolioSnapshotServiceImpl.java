package com.realestate.duediligence.service.impl;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.dto.PortfolioHistoryPoint;
import com.realestate.duediligence.entity.PortfolioSnapshot;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.PortfolioSnapshotRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.PortfolioSnapshotService;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PortfolioSnapshotServiceImpl implements PortfolioSnapshotService {

    private static final Logger log =
            LoggerFactory.getLogger(PortfolioSnapshotServiceImpl.class);

    private final PortfolioSnapshotRepository snapshotRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // ── Startup seed ──────────────────────────────────────────────
    /**
     * Runs once on startup so existing properties appear in the chart
     * immediately — without waiting for the midnight cron.
     * Safe to run multiple times: upsert pattern deletes today's row first.
     */
    @PostConstruct
    public void seedInitialSnapshot() {
        log.info("Seeding initial portfolio snapshot on startup...");
        try {
            takeDailySnapshots();
        } catch (Exception e) {
            log.error("Initial snapshot seed failed: {}", e.getMessage());
        }
    }

    // ── Nightly cron: midnight every day ──────────────────────────
    @Override
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void takeDailySnapshots() {
        log.info("Portfolio snapshot cron starting...");
        LocalDate today = LocalDate.now();

        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            try {
                writeUserSnapshot(user, today);
            } catch (Exception e) {
                log.error("Snapshot failed for user {}: {}", user.getId(), e.getMessage());
            }
        }

        try {
            writePlatformSnapshot(today);
        } catch (Exception e) {
            log.error("Platform snapshot failed: {}", e.getMessage());
        }

        log.info("Portfolio snapshot cron done. {} users snapshotted.", allUsers.size());
    }

    // ── Real-time refresh on property change ──────────────────────
    @Override
    @Transactional
    public void refreshSnapshotForUser(Long userId) {
        LocalDate today = LocalDate.now();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        writeUserSnapshot(user, today);
        writePlatformSnapshot(today);
    }

    // ── Query: user history ───────────────────────────────────────
    @Override
    public List<PortfolioHistoryPoint> getHistoryForUser(Long userId, int days) {
        LocalDate from = LocalDate.now().minusDays(days - 1);
        LocalDate to   = LocalDate.now();

        List<PortfolioSnapshot> rows =
                snapshotRepository.findByUserIdAndDateRange(userId, from, to);

        return fillGaps(rows, from, to);
    }

    // ── Query: platform history (admin) ───────────────────────────
    @Override
    public List<PortfolioHistoryPoint> getPlatformHistory(int days) {
        LocalDate from = LocalDate.now().minusDays(days - 1);
        LocalDate to   = LocalDate.now();

        List<PortfolioSnapshot> rows =
                snapshotRepository.findPlatformSnapshotsInRange(from, to);

        return fillGaps(rows, from, to);
    }

    // ── Internal: write one user snapshot (upsert) ────────────────
    private void writeUserSnapshot(User user, LocalDate date) {
        Long uid = user.getId();

        Double totalValue = propertyRepository.sumMarketValueByUser(uid);
        Integer propCount = propertyRepository.countByCreatedById(uid);
        Integer verCount  = propertyRepository.countVerifiedByUser(uid);
        Integer cities    = propertyRepository.countDistinctCitiesByUser(uid);

        snapshotRepository.deleteByUserIdAndSnapshotDate(uid, date);

        PortfolioSnapshot snap = new PortfolioSnapshot();
        snap.setSnapshotDate(date);
        snap.setTotalValue(totalValue != null ? totalValue : 0.0);
        snap.setPropertyCount(propCount != null ? propCount : 0);
        snap.setVerifiedCount(verCount != null ? verCount : 0);
        snap.setTotalCities(cities != null ? cities : 0);
        snap.setUser(user);

        snapshotRepository.save(snap);
    }

    // ── Internal: write platform snapshot (upsert) ────────────────
    private void writePlatformSnapshot(LocalDate date) {
        Double totalValue = propertyRepository.sumMarketValue();
        Long   propCount  = propertyRepository.count();
        Long   verCount   = propertyRepository.countByVerifiedTrue();
        long cities = propertyRepository.countDistinctCities();

        snapshotRepository.deletePlatformSnapshotByDate(date);

        PortfolioSnapshot snap = new PortfolioSnapshot();
        snap.setSnapshotDate(date);
        snap.setTotalValue(totalValue != null ? totalValue : 0.0);
        snap.setPropertyCount(propCount != null ? propCount.intValue() : 0);
        snap.setVerifiedCount(verCount != null ? verCount.intValue() : 0);
        snap.setTotalCities((int) cities);
        snap.setUser(null);

        snapshotRepository.save(snap);
    }

    // ── Fill gaps: carry-forward last known value ─────────────────
    private List<PortfolioHistoryPoint> fillGaps(
            List<PortfolioSnapshot> rows, LocalDate from, LocalDate to) {

        var byDate = rows.stream().collect(
                Collectors.toMap(PortfolioSnapshot::getSnapshotDate, s -> s));

        List<PortfolioHistoryPoint> result = new ArrayList<>();
        PortfolioSnapshot last = null;

        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            if (byDate.containsKey(d)) {
                last = byDate.get(d);
            }
            if (last != null) {
                result.add(new PortfolioHistoryPoint(
                        d.format(FMT),
                        last.getTotalValue(),
                        last.getPropertyCount(),
                        last.getVerifiedCount(),
                        last.getTotalCities()));
            }
        }

        return result;
    }
}