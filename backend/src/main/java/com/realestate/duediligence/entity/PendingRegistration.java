package com.realestate.duediligence.entity;

import java.time.LocalDateTime;

import com.realestate.duediligence.enums.RoleType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Holds pending user registrations awaiting email OTP verification.
 *
 * Flow:
 *   1. User submits register form → row created here (NOT in users table)
 *   2. OTP is BCrypt-hashed and stored; password is also BCrypt-hashed
 *   3. On successful verification → row promoted to User entity → row deleted
 *   4. Expired / abandoned rows are cleaned up by scheduled job (24hr TTL)
 *
 * Security notes:
 *   • password is stored ALREADY hashed (BCrypt) — never plain
 *   • otp is stored ALREADY hashed (BCrypt) — never plain
 *   • email is UNIQUE — re-registration reuses/updates the same row
 */
@Entity
@Table(
    name = "pending_registrations",
    indexes = {
        @Index(name = "idx_pending_email", columnList = "email", unique = true),
        @Index(name = "idx_pending_otp_expires", columnList = "otp_expires_at")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    /** BCrypt hash of the password — never store plain text. */
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RoleType role;

    /** BCrypt hash of the 6-digit OTP — never store plain text. */
    @Column(name = "otp_hash", nullable = false, length = 255)
    private String otpHash;

    @Column(name = "otp_expires_at", nullable = false)
    private LocalDateTime otpExpiresAt;

    /** Number of verify attempts (max 5, then row deleted). */
    @Column(name = "verify_attempts", nullable = false)
    private int verifyAttempts;

    /** Number of resend requests (max 3 per hour). */
    @Column(name = "resend_count", nullable = false)
    private int resendCount;

    @Column(name = "last_resend_at")
    private LocalDateTime lastResendAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}