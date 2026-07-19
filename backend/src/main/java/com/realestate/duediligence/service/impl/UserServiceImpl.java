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
import com.realestate.duediligence.dto.CompleteGoogleSignupRequest;
import com.realestate.duediligence.dto.DeleteAccountRequest;
import com.realestate.duediligence.dto.ForgotPasswordRequest;
import com.realestate.duediligence.dto.GoogleAuthResponse;
import com.realestate.duediligence.dto.GoogleLoginRequest;
import com.realestate.duediligence.dto.LoginRequest;
import com.realestate.duediligence.dto.RegisterRequest;
import com.realestate.duediligence.dto.ResetPasswordRequest;
import com.realestate.duediligence.dto.VerifyOtpRequest;
import com.realestate.duediligence.entity.Role;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.RoleRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.EmailService;
import com.realestate.duediligence.service.GoogleTokenVerifier;
import com.realestate.duediligence.service.UserService;
import com.realestate.duediligence.util.JwtService;
import com.realestate.duediligence.dto.UserProfileResponse;

@Service
public class UserServiceImpl implements UserService {

    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final GoogleTokenVerifier googleTokenVerifier;

    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            EmailService emailService,
            GoogleTokenVerifier googleTokenVerifier) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.googleTokenVerifier = googleTokenVerifier;
    }

    // ══════════════════════════════════════════════════════════════
    //  REGISTER
    // ══════════════════════════════════════════════════════════════

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        Role role = roleRepository.findByRoleName(request.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(role);
        user.setAuthProvider("LOCAL");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token);
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

        userRepository.findByEmail(request.getEmail()).ifPresent(user ->
                emailService.sendLoginAlert(
                        user.getEmail(),
                        user.getFullName(),
                        getClientIp(),
                        getUserAgent()));

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

    private String generateOtp() {
        int otp = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(otp);
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
}