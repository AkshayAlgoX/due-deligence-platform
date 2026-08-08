package com.realestate.duediligence.security;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.stereotype.Service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;

/**
 * In-memory IP-based rate limiter using Bucket4j.
 *
 * Design:
 *   - One bucket per (endpoint-type, IP) pair
 *   - Buckets stored in ConcurrentHashMap (thread-safe)
 *   - No cleanup needed — inactive buckets are garbage collected
 *     when the map entry is evicted (bounded by memory pressure)
 *
 * Production upgrade path:
 *   - Swap ConcurrentHashMap for Redis-backed store (Bucket4j has Redis module)
 *   - Add per-user limits in addition to per-IP
 *   - Add exponential backoff for repeated violators
 */
@Service
public class RateLimitService {

    /** Login: 5 attempts / minute — prevents brute-force credential stuffing. */
    private static final Bandwidth LOGIN_LIMIT =
            Bandwidth.builder()
                    .capacity(5)
                    .refillGreedy(5, Duration.ofMinutes(1))
                    .build();

    /** Forgot password: 3 requests / hour — prevents email flooding attacks. */
    private static final Bandwidth FORGOT_PASSWORD_LIMIT =
            Bandwidth.builder()
                    .capacity(3)
                    .refillGreedy(3, Duration.ofHours(1))
                    .build();

    /** Register: 10 accounts / hour — prevents spam registrations. */
    private static final Bandwidth REGISTER_LIMIT =
            Bandwidth.builder()
                    .capacity(10)
                    .refillGreedy(10, Duration.ofHours(1))
                    .build();

    /** OTP verification: 10 attempts / 10 minutes — prevents OTP brute-force. */
    private static final Bandwidth OTP_VERIFY_LIMIT =
            Bandwidth.builder()
                    .capacity(10)
                    .refillGreedy(10, Duration.ofMinutes(10))
                    .build();

    /** Export: 30 downloads / minute — prevents server resource exhaustion. */
    private static final Bandwidth EXPORT_LIMIT =
            Bandwidth.builder()
                    .capacity(30)
                    .refillGreedy(30, Duration.ofMinutes(1))
                    .build();

    private final ConcurrentMap<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Bucket> forgotBuckets = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Bucket> registerBuckets = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Bucket> otpBuckets = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Bucket> exportBuckets = new ConcurrentHashMap<>();

    // ── Public API ────────────────────────────────────────────────

    public boolean tryLogin(String ip) {
        return bucketFor(loginBuckets, ip, LOGIN_LIMIT).tryConsume(1);
    }

    public boolean tryForgotPassword(String ip) {
        return bucketFor(forgotBuckets, ip, FORGOT_PASSWORD_LIMIT).tryConsume(1);
    }

    public boolean tryRegister(String ip) {
        return bucketFor(registerBuckets, ip, REGISTER_LIMIT).tryConsume(1);
    }

    public boolean tryOtpVerify(String ip) {
        return bucketFor(otpBuckets, ip, OTP_VERIFY_LIMIT).tryConsume(1);
    }

    public boolean tryExport(String ip) {
        return bucketFor(exportBuckets, ip, EXPORT_LIMIT).tryConsume(1);
    }

    /**
     * Returns seconds until at least one token is available again.
     * Used to populate the Retry-After response header.
     */
    public long secondsUntilRefill(String endpoint, String ip) {
        ConcurrentMap<String, Bucket> map = mapFor(endpoint);
        Bucket bucket = map.get(ip);
        if (bucket == null) return 0;
        long nanos = bucket.estimateAbilityToConsume(1).getNanosToWaitForRefill();
        return Math.max(1, nanos / 1_000_000_000L);
    }

    // ── Helpers ───────────────────────────────────────────────────

    private Bucket bucketFor(ConcurrentMap<String, Bucket> map, String ip, Bandwidth limit) {
        return map.computeIfAbsent(ip, k -> Bucket.builder().addLimit(limit).build());
    }

    private ConcurrentMap<String, Bucket> mapFor(String endpoint) {
        return switch (endpoint) {
            case "login" -> loginBuckets;
            case "forgot" -> forgotBuckets;
            case "register" -> registerBuckets;
            case "otp" -> otpBuckets;
            case "export" -> exportBuckets;
            default -> throw new IllegalArgumentException("Unknown endpoint: " + endpoint);
        };
    }
}