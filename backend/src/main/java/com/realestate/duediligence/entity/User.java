package com.realestate.duediligence.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    // Password now nullable — Google-only users don't have one
    @Column
    private String password;

    // Phone now nullable — Google users may not provide it
    @Column(name = "phone_number")
    private String phoneNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Password Reset ────────────────────────────────────────────
    @Column(name = "reset_otp", length = 6)
    private String resetOtp;

    @Column(name = "reset_otp_expiry")
    private LocalDateTime resetOtpExpiry;

    // ── Google OAuth ──────────────────────────────────────────────
    /**
     * Google's unique user ID (sub claim). Null for email/password users.
     * Used to link account when user signs in with Google.
     */
    @Column(name = "google_id", unique = true)
    private String googleId;

    /**
     * Auth provider: "LOCAL" (email/password) or "GOOGLE".
     * Users can link both by having same email.
     */
    @Column(name = "auth_provider", length = 20)
    private String authProvider;

    /** Profile picture URL from Google (nullable). */
    @Column(name = "profile_picture", length = 500)
    private String profilePicture;

    // ── Session invalidation (Logout of all devices) ──────────────
    /**
     * Timestamp marking when the user last invalidated all sessions.
     * JWT filter rejects any token whose `iat` claim is before this value.
     * Null for existing users → treated as "no restriction" (safe default).
     */
    @Column(name = "token_valid_from")
    private LocalDateTime tokenValidFrom;
    // ── Admin Dashboard: Account status ────────────────────────────
    /** Whether the account is active. Defaults to true for all users. */
    @Column(name = "is_active")
    private Boolean isActive = true;

    /** Whether an admin has banned this account. Defaults to false. */
    @Column(name = "is_banned")
    private Boolean isBanned = false;

    // ── Milestone 3: Due Diligence Reports ──────────────────────────
    @OneToMany(mappedBy = "generatedBy", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DueDiligenceReport> reports = new ArrayList<>();
}