package com.realestate.duediligence.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.after;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import com.realestate.duediligence.entity.NotificationPreference;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.NotificationType;
import com.realestate.duediligence.enums.RoleType;
import com.realestate.duediligence.repository.NotificationPreferenceRepository;
import com.realestate.duediligence.repository.RoleRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.AfterCommit;
import com.realestate.duediligence.service.EmailService;
import com.realestate.duediligence.service.NotificationEventListener;
import com.realestate.duediligence.service.NotificationPreferenceProvisioner;
import com.realestate.duediligence.service.NotificationService;

/**
 * Notification preference initialisation against a real PostgreSQL server.
 *
 * H2 does not reproduce PostgreSQL's row locking on a pending unique key,
 * so the race that dropped report-ready emails is exercised here. The
 * interleaving tests use latches, not timing, to force the production
 * order: one transaction holds an uncommitted preference row while a
 * second caller initialises the same user.
 */
@SpringBootTest
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
class NotificationPreferenceConcurrencyIT {

    @Container
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16-alpine");

    // DatabasePoolConfig builds the DataSource from spring.datasource.*,
    // so @ServiceConnection would be ignored; set the properties directly.
    @DynamicPropertySource
    static void datasource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }

    @Autowired NotificationPreferenceProvisioner provisioner;
    @Autowired NotificationPreferenceRepository preferenceRepository;
    @Autowired NotificationService notificationService;
    @Autowired NotificationEventListener listener;
    @Autowired UserRepository userRepository;
    @Autowired RoleRepository roleRepository;
    @Autowired PlatformTransactionManager transactionManager;
    @Autowired JdbcTemplate jdbc;

    @MockitoBean EmailService emailService;

    private TransactionTemplate tx;
    private ExecutorService pool;
    private User user;

    @BeforeEach
    void setUp() {
        tx = new TransactionTemplate(transactionManager);
        pool = Executors.newFixedThreadPool(16);
        user = newUser();
        reset(emailService);
    }

    @AfterEach
    void tearDown() {
        pool.shutdownNow();
    }

    @Test
    void runsAgainstPostgres() {
        // Guards against silently falling back to the H2 test datasource.
        assertThat(jdbc.queryForObject("SELECT version()", String.class)).startsWith("PostgreSQL 16");
    }

    // ── Provisioning ──────────────────────────────────────────────

    @Test
    void concurrentFirstAccessCreatesExactlyOneRow() throws Exception {
        int callers = 16;
        CyclicBarrier start = new CyclicBarrier(callers);
        List<Future<Long>> results = new ArrayList<>();
        for (int i = 0; i < callers; i++) {
            results.add(pool.submit(() -> {
                start.await(10, TimeUnit.SECONDS);
                return provisioner.getOrCreate(user).getId();
            }));
        }

        Set<Long> ids = new java.util.HashSet<>();
        for (Future<Long> f : results) {
            ids.add(f.get(30, TimeUnit.SECONDS)); // rethrows any caller failure
        }
        assertThat(ids).hasSize(1);
        assertThat(preferenceRows(user)).isEqualTo(1);
    }

    @Test
    void secondCallerWaitsForUncommittedRowInsteadOfFailing() throws Exception {
        CountDownLatch inserted = new CountDownLatch(1);
        CountDownLatch release = new CountDownLatch(1);

        Future<Long> holder = pool.submit(() -> tx.execute(status -> {
            Long id = provisioner.getOrCreate(user).getId();
            inserted.countDown();
            await(release);
            return id;
        }));
        assertThat(inserted.await(10, TimeUnit.SECONDS)).isTrue();

        Future<Long> second = pool.submit(() -> provisioner.getOrCreate(user).getId());

        // The second insert is blocked on the first transaction's row lock.
        Thread.sleep(500);
        assertThat(second.isDone()).isFalse();

        release.countDown();
        Long holderId = holder.get(10, TimeUnit.SECONDS);
        assertThat(second.get(10, TimeUnit.SECONDS)).isEqualTo(holderId);
        assertThat(preferenceRows(user)).isEqualTo(1);
    }

    /** The previous find-then-save code under the same interleaving: the defect being fixed. */
    @Test
    void findThenSaveFailsUnderTheSameInterleaving() throws Exception {
        CountDownLatch inserted = new CountDownLatch(1);
        CountDownLatch release = new CountDownLatch(1);

        Future<?> holder = pool.submit(() -> tx.executeWithoutResult(status -> {
            provisioner.getOrCreate(user);
            inserted.countDown();
            await(release);
        }));
        assertThat(inserted.await(10, TimeUnit.SECONDS)).isTrue();

        Future<NotificationPreference> legacy = pool.submit(() ->
                preferenceRepository.findByUserId(user.getId())
                        .orElseGet(() -> preferenceRepository.save(
                                NotificationPreference.builder().user(user).build())));

        Thread.sleep(500);
        release.countDown();
        holder.get(10, TimeUnit.SECONDS);

        assertThatThrownBy(() -> legacy.get(10, TimeUnit.SECONDS))
                .hasCauseInstanceOf(DataIntegrityViolationException.class);
        assertThat(preferenceRows(user)).isEqualTo(1);
    }

    @Test
    void insertDefaultsNeverOverwritesExistingPreferences() {
        NotificationPreference prefs = provisioner.getOrCreate(user);
        prefs.setReportReadyEmail(false);
        prefs.setPriceChangeEmail(true);
        preferenceRepository.save(prefs);

        int inserted = tx.execute(status -> preferenceRepository.insertDefaultsIfAbsent(
                user.getId(), true, true, true, true, false, true, true, true));

        assertThat(inserted).isZero();
        NotificationPreference reloaded = preferenceRepository.findByUserId(user.getId()).orElseThrow();
        assertThat(reloaded.isReportReadyEmail()).isFalse();
        assertThat(reloaded.isPriceChangeEmail()).isTrue();
    }

    @Test
    void newRowGetsTheEntityDefaults() {
        NotificationPreference created = provisioner.getOrCreate(user);
        NotificationPreference defaults = NotificationPreference.builder().build();

        assertThat(created.isReportReadyEmail()).isEqualTo(defaults.isReportReadyEmail());
        assertThat(created.isReportReadyInApp()).isEqualTo(defaults.isReportReadyInApp());
        assertThat(created.isRiskAlertEmail()).isEqualTo(defaults.isRiskAlertEmail());
        assertThat(created.isRiskAlertInApp()).isEqualTo(defaults.isRiskAlertInApp());
        assertThat(created.isPriceChangeEmail()).isEqualTo(defaults.isPriceChangeEmail());
        assertThat(created.isPriceChangeInApp()).isEqualTo(defaults.isPriceChangeInApp());
        assertThat(created.isSystemEmail()).isEqualTo(defaults.isSystemEmail());
        assertThat(created.isSystemInApp()).isEqualTo(defaults.isSystemInApp());
    }

    // ── Report-ready delivery (the production path) ───────────────

    @Test
    void reportReadyDeliversOneInAppNotificationAndOneEmailAfterCommit() throws Exception {
        CountDownLatch dispatched = new CountDownLatch(1);

        Future<?> report = pool.submit(() -> tx.executeWithoutResult(status -> {
            notificationService.createForUser(user, NotificationType.REPORT_READY,
                    "Your report is ready", "Report generated.", "/reports/1");
            AfterCommit.run(() -> listener.onReportReady(user, "Report", "Address", 1L));
            dispatched.countDown();
            // Hold the transaction open with its uncommitted preference row.
            sleep(500);
        }));
        assertThat(dispatched.await(10, TimeUnit.SECONDS)).isTrue();
        verify(emailService, after(300).never())
                .sendReportReadyEmail(anyString(), any(), any(), any(), anyLong());

        report.get(10, TimeUnit.SECONDS);

        verify(emailService, timeout(5000).times(1)).sendReportReadyEmail(
                eq(user.getEmail()), eq(user.getFullName()), eq("Report"), eq("Address"), eq(1L));
        verify(emailService, after(500).times(1))
                .sendReportReadyEmail(anyString(), any(), any(), any(), anyLong());
        assertThat(notificationRows(user)).isEqualTo(1);
        assertThat(preferenceRows(user)).isEqualTo(1);
    }

    @Test
    void rolledBackReportSendsNoEmailAndLeavesNoRows() {
        tx.executeWithoutResult(status -> {
            notificationService.createForUser(user, NotificationType.REPORT_READY,
                    "Your report is ready", "Report generated.", "/reports/1");
            AfterCommit.run(() -> listener.onReportReady(user, "Report", "Address", 1L));
            status.setRollbackOnly();
        });

        verify(emailService, after(1000).never())
                .sendReportReadyEmail(anyString(), any(), any(), any(), anyLong());
        assertThat(notificationRows(user)).isZero();
        assertThat(preferenceRows(user)).isZero();
    }

    @Test
    void emailFailureLeavesTheInAppNotificationPersisted() {
        doThrow(new RuntimeException("SMTP down"))
                .when(emailService).sendReportReadyEmail(anyString(), any(), any(), any(), anyLong());

        tx.executeWithoutResult(status -> {
            notificationService.createForUser(user, NotificationType.REPORT_READY,
                    "Your report is ready", "Report generated.", "/reports/1");
            AfterCommit.run(() -> listener.onReportReady(user, "Report", "Address", 1L));
        });

        verify(emailService, timeout(5000).times(1))
                .sendReportReadyEmail(anyString(), any(), any(), any(), anyLong());
        assertThat(notificationRows(user)).isEqualTo(1);
        assertThat(preferenceRows(user)).isEqualTo(1);
    }

    @Test
    void disabledEmailPreferenceIsHonoured() {
        NotificationPreference prefs = provisioner.getOrCreate(user);
        prefs.setReportReadyEmail(false);
        preferenceRepository.save(prefs);

        listener.onReportReady(user, "Report", "Address", 1L);

        verify(emailService, after(1000).never())
                .sendReportReadyEmail(anyString(), any(), any(), any(), anyLong());
    }

    // ── Helpers ───────────────────────────────────────────────────

    private User newUser() {
        User u = new User();
        u.setFullName("Concurrency Test");
        u.setEmail("notif-" + UUID.randomUUID() + "@test.local");
        u.setPassword("not-a-real-hash");
        u.setRole(roleRepository.findByRoleName(RoleType.BUYER).orElseThrow());
        return userRepository.save(u);
    }

    private int preferenceRows(User u) {
        return jdbc.queryForObject(
                "SELECT COUNT(*) FROM notification_preferences WHERE user_id = ?", Integer.class, u.getId());
    }

    private int notificationRows(User u) {
        return jdbc.queryForObject(
                "SELECT COUNT(*) FROM notifications WHERE user_id = ?", Integer.class, u.getId());
    }

    private static void await(CountDownLatch latch) {
        try {
            if (!latch.await(10, TimeUnit.SECONDS)) throw new IllegalStateException("latch timeout");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
    }

    private static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
