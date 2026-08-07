package com.realestate.duediligence.service.impl;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.realestate.duediligence.dto.ApiResponse;
import com.realestate.duediligence.dto.AuthResponse;
import com.realestate.duediligence.dto.ChangePasswordRequest;
import com.realestate.duediligence.dto.CompleteGoogleSignupRequest;
import com.realestate.duediligence.dto.DeleteAccountRequest;
import com.realestate.duediligence.dto.ForgotPasswordRequest;
import com.realestate.duediligence.dto.GoogleAuthResponse;
import com.realestate.duediligence.dto.GoogleLoginRequest;
import com.realestate.duediligence.dto.LoginRequest;
import com.realestate.duediligence.dto.ResendRegistrationOtpRequest;
import com.realestate.duediligence.dto.ResetPasswordRequest;
import com.realestate.duediligence.dto.SendOtpResponse;
import com.realestate.duediligence.dto.SendRegistrationOtpRequest;
import com.realestate.duediligence.dto.UpdateProfileRequest;
import com.realestate.duediligence.dto.UserProfileResponse;
import com.realestate.duediligence.dto.VerifyOtpRequest;
import com.realestate.duediligence.dto.VerifyRegistrationOtpRequest;
import com.realestate.duediligence.entity.PendingRegistration;
import com.realestate.duediligence.entity.Role;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.entity.AuditLog;
import com.realestate.duediligence.repository.PendingRegistrationRepository;
import com.realestate.duediligence.repository.RoleRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.EmailService;
import com.realestate.duediligence.service.GoogleTokenVerifier;
import com.realestate.duediligence.service.UserService;
import com.realestate.duediligence.service.AuditLogService;
import com.realestate.duediligence.util.JwtService;
import com.realestate.duediligence.dto.ResendRegistrationOtpRequest;
import com.realestate.duediligence.dto.SendOtpResponse;
import com.realestate.duediligence.dto.SendRegistrationOtpRequest;
import com.realestate.duediligence.dto.VerifyRegistrationOtpRequest;
import com.realestate.duediligence.entity.PendingRegistration;
import com.realestate.duediligence.repository.PendingRegistrationRepository;
import com.realestate.duediligence.enums.RoleType;
import com.realestate.duediligence.enums.AuditAction;

@Service
public class UserServiceImpl implements UserService {

    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int OTP_RESEND_COOLDOWN_SECONDS = 60;
    private static final int OTP_MAX_RESENDS_PER_HOUR = 3;
    private static final int OTP_MAX_VERIFY_ATTEMPTS = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AuditLogService auditLogService;
    private final GoogleTokenVerifier googleTokenVerifier;

        public UserServiceImpl(
            UserRepository userRepository,
            PendingRegistrationRepository pendingRegistrationRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            EmailService emailService,
            AuditLogService auditLogService,
            GoogleTokenVerifier googleTokenVerifier) {

        this.userRepository = userRepository;
        this.pendingRegistrationRepository = pendingRegistrationRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.auditLogService = auditLogService;
        this.googleTokenVerifier = googleTokenVerifier;
    }

    // ══════════════════════════════════════════════════════════════
    //  REGISTER
    // ══════════════════════════════════════════════════════════════

       // ══════════════════════════════════════════════════════════════
    //  REGISTER — OTP FLOW (STEP 1: send OTP + create pending row)
    // ══════════════════════════════════════════════════════════════

    @Override
    public SendOtpResponse sendRegistrationOtp(SendRegistrationOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        // 1. Reject if a verified account already exists
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists. Please sign in instead.");
        }
        
    // ⭐ SECURITY: Never allow ADMIN role via public registration
    if (request.getRole() != null && "ADMIN".equals(request.getRole().name())) {
        throw new IllegalArgumentException(
                "Invalid role selected. Please choose a valid account type.");
    }

    // 2. Validate role exists
    Role role = roleRepository.findByRoleName(request.getRole())
            .orElseThrow(() -> new RuntimeException("Invalid role selected"));
    


        // 3. Look up existing pending row (if user is re-submitting the form)
        PendingRegistration pending = pendingRegistrationRepository
                .findByEmail(email)
                .orElse(null);

        LocalDateTime now = LocalDateTime.now();

        if (pending != null) {
            // Enforce hourly resend cap on the pending row itself
            if (pending.getLastResendAt() != null
                    && pending.getLastResendAt().isAfter(now.minusHours(1))
                    && pending.getResendCount() >= OTP_MAX_RESENDS_PER_HOUR) {
                throw new IllegalArgumentException(
                        "Too many verification attempts. Please try again in an hour.");
            }
            // Enforce cooldown between resends
            if (pending.getLastResendAt() != null
                    && pending.getLastResendAt().isAfter(now.minusSeconds(OTP_RESEND_COOLDOWN_SECONDS))) {
                long wait = OTP_RESEND_COOLDOWN_SECONDS -
                        java.time.Duration.between(pending.getLastResendAt(), now).getSeconds();
                throw new IllegalArgumentException(
                        "Please wait " + Math.max(wait, 1) + " seconds before requesting a new code.");
            }
        }

        // 4. Generate + hash the OTP (never store plain)
        String otp = generateOtp();
        String otpHash = passwordEncoder.encode(otp);

        // 5. Hash the password (never store plain even in pending row)
        String passwordHash = passwordEncoder.encode(request.getPassword());

        if (pending == null) {
            pending = PendingRegistration.builder()
                    .email(email)
                    .fullName(request.getFullName().trim())
                    .passwordHash(passwordHash)
                    .phoneNumber(request.getPhoneNumber())
                    .role(request.getRole())
                    .otpHash(otpHash)
                    .otpExpiresAt(now.plusMinutes(OTP_EXPIRY_MINUTES))
                    .verifyAttempts(0)
                    .resendCount(1)
                    .lastResendAt(now)
                    .createdAt(now)
                    .build();
        } else {
            // Update existing row with fresh data + fresh OTP
            pending.setFullName(request.getFullName().trim());
            pending.setPasswordHash(passwordHash);
            pending.setPhoneNumber(request.getPhoneNumber());
            pending.setRole(request.getRole());
            pending.setOtpHash(otpHash);
            pending.setOtpExpiresAt(now.plusMinutes(OTP_EXPIRY_MINUTES));
            pending.setVerifyAttempts(0);
            pending.setResendCount(pending.getResendCount() + 1);
            pending.setLastResendAt(now);
        }

        pendingRegistrationRepository.save(pending);

        // 6. Send OTP email (async — non-blocking)
        emailService.sendRegistrationOtp(email, otp, pending.getFullName());

        return new SendOtpResponse(
                true,
                "Verification code sent. Please check your email.",
                maskEmail(email),
                OTP_RESEND_COOLDOWN_SECONDS,
                OTP_EXPIRY_MINUTES * 60
        );
    }

    // ══════════════════════════════════════════════════════════════
    //  REGISTER — OTP FLOW (STEP 2: verify OTP + create real user + auto-login)
    // ══════════════════════════════════════════════════════════════

    @Override
    public AuthResponse verifyRegistrationOtp(VerifyRegistrationOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        PendingRegistration pending = pendingRegistrationRepository
                .findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No pending registration found. Please start over."));

        // Expiry check
        if (LocalDateTime.now().isAfter(pending.getOtpExpiresAt())) {
            pendingRegistrationRepository.delete(pending);
            throw new IllegalArgumentException(
                    "Verification code has expired. Please request a new one.");
        }

        // Attempt-cap check
        if (pending.getVerifyAttempts() >= OTP_MAX_VERIFY_ATTEMPTS) {
            pendingRegistrationRepository.delete(pending);
            throw new IllegalArgumentException(
                    "Too many failed attempts. Please start the registration again.");
        }

        // OTP match — BCrypt.matches is constant-time
        if (!passwordEncoder.matches(request.getOtp(), pending.getOtpHash())) {
            pending.setVerifyAttempts(pending.getVerifyAttempts() + 1);
            pendingRegistrationRepository.save(pending);
            int remaining = OTP_MAX_VERIFY_ATTEMPTS - pending.getVerifyAttempts();
            throw new IllegalArgumentException(
                    "Invalid code. " + remaining + " attempt(s) remaining.");
        }

        // ── Success — promote pending to real User ──
        // Double-check race condition: someone else may have registered this
        // email in the window between sendOtp and verifyOtp
        if (userRepository.existsByEmail(email)) {
            pendingRegistrationRepository.delete(pending);
            throw new IllegalArgumentException(
                    "An account with this email already exists. Please sign in.");
        }

        Role role = roleRepository.findByRoleName(pending.getRole())
                .orElseThrow(() -> new RuntimeException("Role no longer exists"));

        User user = new User();
        user.setFullName(pending.getFullName());
        user.setEmail(pending.getEmail());
        // password already BCrypt-hashed on pending — do NOT re-hash
        user.setPassword(pending.getPasswordHash());
        user.setPhoneNumber(pending.getPhoneNumber());
        user.setRole(role);
        user.setAuthProvider("LOCAL");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        saveAuditLog(
        user,
        AuditAction.USER_REGISTERED,
        "USER",
        user.getId(),
        "User registered successfully");

        // Clean up the pending row
        pendingRegistrationRepository.delete(pending);

        // Fire-and-forget welcome + login-alert emails
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
        emailService.sendLoginAlert(user.getEmail(), user.getFullName(),
                getClientIp(), getUserAgent());

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token);
    }

    // ══════════════════════════════════════════════════════════════
    //  REGISTER — OTP FLOW (STEP 3: resend OTP)
    // ══════════════════════════════════════════════════════════════

    @Override
    public SendOtpResponse resendRegistrationOtp(ResendRegistrationOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        PendingRegistration pending = pendingRegistrationRepository
                .findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No pending registration found. Please start over."));

        LocalDateTime now = LocalDateTime.now();

        // Hourly cap
        if (pending.getLastResendAt() != null
                && pending.getLastResendAt().isAfter(now.minusHours(1))
                && pending.getResendCount() >= OTP_MAX_RESENDS_PER_HOUR) {
            throw new IllegalArgumentException(
                    "Too many verification attempts. Please try again in an hour.");
        }

        // Cooldown
        if (pending.getLastResendAt() != null
                && pending.getLastResendAt().isAfter(now.minusSeconds(OTP_RESEND_COOLDOWN_SECONDS))) {
            long wait = OTP_RESEND_COOLDOWN_SECONDS -
                    java.time.Duration.between(pending.getLastResendAt(), now).getSeconds();
            throw new IllegalArgumentException(
                    "Please wait " + Math.max(wait, 1) + " seconds before requesting a new code.");
        }

        // Reset resend counter if last resend was over an hour ago
        if (pending.getLastResendAt() == null
                || pending.getLastResendAt().isBefore(now.minusHours(1))) {
            pending.setResendCount(0);
        }

        String otp = generateOtp();
        pending.setOtpHash(passwordEncoder.encode(otp));
        pending.setOtpExpiresAt(now.plusMinutes(OTP_EXPIRY_MINUTES));
        pending.setVerifyAttempts(0);
        pending.setResendCount(pending.getResendCount() + 1);
        pending.setLastResendAt(now);
        pendingRegistrationRepository.save(pending);

        emailService.sendRegistrationOtp(email, otp, pending.getFullName());

        return new SendOtpResponse(
                true,
                "A new verification code has been sent to your email.",
                maskEmail(email),
                OTP_RESEND_COOLDOWN_SECONDS,
                OTP_EXPIRY_MINUTES * 60
        );
    }
    // ══════════════════════════════════════════════════════════════
    //  LOGIN
    // ══════════════════════════════════════════════════════════════

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        String token = jwtService.generateToken(request.getEmail());

        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {

           emailService.sendLoginAlert(
                   user.getEmail(),
                   user.getFullName(),
                   getClientIp(),
                   getUserAgent());

    
            saveAuditLog(
                    user,
                    AuditAction.LOGIN,
                    "USER",
                    user.getId(),
                    "User logged in");
    });

        return new AuthResponse(token);
    }

    // ══════════════════════════════════════════════════════════════
    //  GOOGLE SIGN-IN — 2-STEP FLOW
    // ══════════════════════════════════════════════════════════════

    @Override
    public GoogleAuthResponse loginWithGoogle(GoogleLoginRequest request) {
        Payload payload = googleTokenVerifier.verify(request.getCredential());

        String email = payload.getEmail();
        String googleId = payload.getSubject();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");
        Boolean emailVerified = payload.getEmailVerified();

        if (email == null || Boolean.FALSE.equals(emailVerified)) {
            throw new IllegalArgumentException("Google email is not verified");
        }

        var existingUser = userRepository.findByEmail(email);

        if (existingUser.isEmpty()) {
            return new GoogleAuthResponse(
                    "PROFILE_INCOMPLETE",
                    null,
                    email,
                    name,
                    picture
            );
        }

        User user = existingUser.get();

        if (user.getGoogleId() == null) {
            user.setGoogleId(googleId);
            user.setProfilePicture(picture);
            user.setAuthProvider("LOCAL_AND_GOOGLE");
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            saveAuditLog(
                    user,
                    AuditAction.USER_REGISTERED,
                    "USER",
                    user.getId(),
                    "Google registration completed");
    }

        String token = jwtService.generateToken(email);

        emailService.sendLoginAlert(user.getEmail(), user.getFullName(),
                getClientIp(), getUserAgent());

        return new GoogleAuthResponse(
                "AUTHENTICATED",
                token,
                email,
                user.getFullName(),
                user.getProfilePicture()
        );
    }

    @Override
    public AuthResponse completeGoogleSignup(CompleteGoogleSignupRequest request) {
        Payload payload = googleTokenVerifier.verify(request.getCredential());

        String email = payload.getEmail();
        String googleId = payload.getSubject();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists. Please sign in.");
        }

         // ⭐ SECURITY: Never allow ADMIN role via public registration
    if (request.getRole() != null && "ADMIN".equals(request.getRole().name())) {
        throw new IllegalArgumentException(
                "Invalid role selected. Please choose a valid account type.");
    }

    Role role = roleRepository.findByRoleName(request.getRole())
            .orElseThrow(() -> new RuntimeException("Invalid role selected"));


        User user = new User();
        user.setEmail(email);
        user.setFullName(name != null ? name : email.split("@")[0]);
        user.setPhoneNumber(request.getPhoneNumber());
        user.setGoogleId(googleId);
        user.setProfilePicture(picture);
        user.setAuthProvider("GOOGLE");
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        saveAuditLog(
                 user,
                 AuditAction.USER_REGISTERED,
                 "USER",
                 user.getId(),
                 "Google user registered");

        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        String token = jwtService.generateToken(email);

        emailService.sendLoginAlert(user.getEmail(), user.getFullName(),
                getClientIp(), getUserAgent());

        return new AuthResponse(token);
    }

    // ══════════════════════════════════════════════════════════════
    //  PASSWORD RESET FLOW
    // ══════════════════════════════════════════════════════════════

    @Override
    public ApiResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null) {
            if ("GOOGLE".equals(user.getAuthProvider())) {
                return new ApiResponse(false,
                    "This account uses Google Sign-In. Please continue with Google.");
            }

            String otp = generateOtp();
            user.setResetOtp(otp);
            user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            emailService.sendPasswordResetOtp(user.getEmail(), otp, user.getFullName());
        }

        // Same response whether email exists or not (prevents account enumeration)
        return new ApiResponse(true,
                "If an account exists with this email, a reset code has been sent.");
    }

    @Override
    public ApiResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid or expired code"));

        if (user.getResetOtp() == null || user.getResetOtpExpiry() == null) {
            return new ApiResponse(false, "No active reset request. Please request a new code.");
        }

        if (LocalDateTime.now().isAfter(user.getResetOtpExpiry())) {
            user.setResetOtp(null);
            user.setResetOtpExpiry(null);
            userRepository.save(user);
            return new ApiResponse(false, "Code has expired. Please request a new one.");
        }

        if (!user.getResetOtp().equals(request.getOtp())) {
            return new ApiResponse(false, "Invalid code. Please check and try again.");
        }

        return new ApiResponse(true, "Code verified. You may now reset your password.");
    }

    @Override
    public ApiResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid request"));

        if (user.getResetOtp() == null || user.getResetOtpExpiry() == null) {
            return new ApiResponse(false, "No active reset request. Please start over.");
        }

        if (LocalDateTime.now().isAfter(user.getResetOtpExpiry())) {
            user.setResetOtp(null);
            user.setResetOtpExpiry(null);
            userRepository.save(user);
            return new ApiResponse(false, "Code has expired. Please request a new one.");
        }

        if (!user.getResetOtp().equals(request.getOtp())) {
            return new ApiResponse(false, "Invalid code.");
        }

        // Reject reuse of current password (BCrypt.matches handles salt)
        if (user.getPassword() != null &&
            passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            return new ApiResponse(false,
                "New password cannot be the same as your current password.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        saveAuditLog(
                 user,
                 AuditAction.PASSWORD_CHANGED,
                 "USER",
                 user.getId(),
                 "Password reset");

        return new ApiResponse(true, "Password reset successfully. You can now sign in.");
    }

    // ══════════════════════════════════════════════════════════════
    //  ACCOUNT DELETION (GDPR / DPDP right to erasure)
    // ══════════════════════════════════════════════════════════════

    @Override
    public ApiResponse deleteAccount(String email, DeleteAccountRequest request) {
        // 1. Confirmation phrase check
        if (!"DELETE".equals(request.getConfirmation())) {
            return new ApiResponse(false, "Please type DELETE exactly to confirm.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        // 2. Password / email verification
        boolean isGoogleOnly = "GOOGLE".equals(user.getAuthProvider());

        if (isGoogleOnly) {
            // Google-only users type their email to confirm (no local password exists)
            if (!email.equalsIgnoreCase(request.getPassword())) {
                return new ApiResponse(false,
                        "Please type your email address to confirm.");
            }
        } else {
            // Local + hybrid users must provide current password
            if (user.getPassword() == null ||
                !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return new ApiResponse(false,
                        "Incorrect password. Account was not deleted.");
            }
        }

        // 3. Capture data before delete (for farewell email)
        String userName = user.getFullName();

        // 4. Delete (cascade removes their properties via @OnDelete)
        userRepository.delete(user);

        saveAuditLog(
                 user,
                 AuditAction.PROFILE_UPDATED,
                 "USER",
                 user.getId(),
                 "Account deleted");

        // 5. Send farewell email (best effort)
        try {
            emailService.sendAccountDeletionEmail(email, userName);
        } catch (Exception e) {
            System.err.println("Failed to send deletion email: " + e.getMessage());
        }

        return new ApiResponse(true, "Your account has been permanently deleted.");
    }

    // ══════════════════════════════════════════════════════════════
    //  HELPERS
    // ══════════════════════════════════════════════════════════════

    private void saveAuditLog(
        User user,
        AuditAction action,
        String resourceType,
        Long resourceId,
        String details) {

    AuditLog log = new AuditLog();

    log.setUser(user);

    log.setAction(action);

    log.setResourceType(resourceType);

    log.setResourceId(resourceId);

    log.setDetailsJson(details);

    log.setIpAddress(getClientIp());

    log.setUserAgent(getUserAgent());

    log.setCreatedAt(LocalDateTime.now());

    auditLogService.save(log);
    
    }

    private String generateOtp() {
        int otp = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }
        /**
     * Masks an email like "john.doe@gmail.com" → "j***@gmail.com".
     * Used in OTP responses so the frontend can display where the code was sent
     * without revealing the full address in URLs or logs.
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "***";
        int at = email.indexOf('@');
        String local = email.substring(0, at);
        String domain = email.substring(at);
        if (local.length() <= 1) return local + "***" + domain;
        return local.charAt(0) + "***" + domain;
    }

    private String getClientIp() {
        try {
            var request = ((org.springframework.web.context.request.ServletRequestAttributes)
                org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes())
                .getRequest();
            String xForwarded = request.getHeader("X-Forwarded-For");
            if (xForwarded != null && !xForwarded.isBlank()) {
                return xForwarded.split(",")[0].trim();
            }
            String ip = request.getRemoteAddr();
            if ("0:0:0:0:0:0:0:1".equals(ip)) return "127.0.0.1 (localhost)";
            return ip;
        } catch (Exception e) {
            return "Unknown";
        }
    }

    private String getUserAgent() {
        try {
            var request = ((org.springframework.web.context.request.ServletRequestAttributes)
                org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes())
                .getRequest();
            return request.getHeader("User-Agent");
        } catch (Exception e) {
            return "Unknown";
        }
    }

    @Override
public UserProfileResponse getCurrentUserProfile(String email) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    return UserProfileResponse.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .phoneNumber(user.getPhoneNumber())
            .role(user.getRole() != null ? user.getRole().getRoleName().toString() : null)
            .authProvider(user.getAuthProvider())
            .profilePicture(user.getProfilePicture())
            .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
            .build();
}
    // ══════════════════════════════════════════════════════════════
    //  UPDATE PROFILE (fullName + phoneNumber only)
    // ══════════════════════════════════════════════════════════════

    @Override
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean changed = false;

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            String trimmed = request.getFullName().trim();
            if (!trimmed.equals(user.getFullName())) {
                user.setFullName(trimmed);
                changed = true;
            }
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
    if (!request.getPhoneNumber().equals(user.getPhoneNumber())) {
        user.setPhoneNumber(request.getPhoneNumber());
        changed = true;
    }
}

// Profile picture: null = leave unchanged, "" = remove, otherwise = update
if (request.getProfilePicture() != null) {
    String newPic = request.getProfilePicture().isBlank() ? null : request.getProfilePicture().trim();
    if ((newPic == null && user.getProfilePicture() != null) ||
        (newPic != null && !newPic.equals(user.getProfilePicture()))) {
        user.setProfilePicture(newPic);
        changed = true;
    }
}

if (changed) {

    user.setUpdatedAt(LocalDateTime.now());

    userRepository.save(user);

    saveAuditLog(
            user,
            AuditAction.PROFILE_UPDATED,
            "USER",
            user.getId(),
            "Profile updated");
}

        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole() != null ? user.getRole().getRoleName().toString() : null)
                .authProvider(user.getAuthProvider())
                .profilePicture(user.getProfilePicture())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }

    // ══════════════════════════════════════════════════════════════
    //  CHANGE PASSWORD (authenticated user, knows current password)
    // ══════════════════════════════════════════════════════════════

       @Override
    public ApiResponse changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Google-only accounts have no local password to change
        if ("GOOGLE".equals(user.getAuthProvider()) || user.getPassword() == null) {
            return new ApiResponse(false,
                    "This account signs in with Google. Password change is not available.");
        }

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return new ApiResponse(false, "Current password is incorrect.");
        }

        // Reject same password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            return new ApiResponse(false,
                    "New password cannot be the same as your current password.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        saveAuditLog(
        user,
        AuditAction.PASSWORD_CHANGED,
        "USER",
        user.getId(),
        "Password changed");

        return new ApiResponse(true, "Password changed successfully.");
    }

    // ══════════════════════════════════════════════════════════════
    //  LOGOUT OF ALL DEVICES (session invalidation across every session)
    // ══════════════════════════════════════════════════════════════

    @Override
    public ApiResponse logoutAllDevices(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Set the cutoff — JWT filter will reject any token issued before this
        user.setTokenValidFrom(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        saveAuditLog(
        user,
        AuditAction.LOGOUT,
        "USER",
        user.getId(),
        "Logged out from all devices");

        return new ApiResponse(true, "Signed out from all devices successfully.");
    }
    
}