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
import com.realestate.duediligence.dto.ForgotPasswordRequest;
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
import com.realestate.duediligence.dto.CompleteGoogleSignupRequest;
import com.realestate.duediligence.dto.GoogleAuthResponse;

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

    @Override
public AuthResponse register(RegisterRequest request) {
    // Duplicate email check — throw instead of returning success:false
    // Your global exception handler will convert this to a proper 409 response
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new IllegalArgumentException("Email already exists");
    }

    // Fetch role
    Role role = roleRepository.findByRoleName(request.getRole())
            .orElseThrow(() -> new RuntimeException("Role not found"));

    // Create user
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

    // Send welcome email (async, non-blocking)
    emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

    // Generate JWT — user is now logged in
    String token = jwtService.generateToken(user.getEmail());

    // Optional: send login alert since this is effectively a login
    // (Uncomment if you want new users to also get the "new login" email)
    // emailService.sendLoginAlert(user.getEmail(), user.getFullName(),
    //         getClientIp(), getUserAgent());

    return new AuthResponse(token);
}
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

/**
 * Step 1: Google Sign-In (called from frontend after Google popup).
 *
 * - Existing user → return AUTHENTICATED + JWT
 * - New user      → return PROFILE_INCOMPLETE (frontend shows role picker)
 */
@Override
public GoogleAuthResponse loginWithGoogle(GoogleLoginRequest request) {
    // 1. Verify token with Google
    Payload payload = googleTokenVerifier.verify(request.getCredential());

    String email = payload.getEmail();
    String googleId = payload.getSubject();
    String name = (String) payload.get("name");
    String picture = (String) payload.get("picture");
    Boolean emailVerified = payload.getEmailVerified();

    if (email == null || Boolean.FALSE.equals(emailVerified)) {
        throw new IllegalArgumentException("Google email is not verified");
    }

    // 2. Check if user exists
    var existingUser = userRepository.findByEmail(email);

    if (existingUser.isEmpty()) {
        // 🆕 NEW USER → frontend must show profile completion form
        System.out.println("\n🆕 New Google user detected: " + email + " — requesting profile completion\n");

        return new GoogleAuthResponse(
                "PROFILE_INCOMPLETE",
                null,       // no token yet
                email,
                name,
                picture
        );
    }

    // ✅ EXISTING USER → login immediately
    User user = existingUser.get();

    // Link Google to existing local account if needed
    if (user.getGoogleId() == null) {
        user.setGoogleId(googleId);
        user.setProfilePicture(picture);
        user.setAuthProvider("LOCAL_AND_GOOGLE");
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    // Generate JWT
    String token = jwtService.generateToken(email);

    // Send login alert
    String ip = getClientIp();
    String userAgent = getUserAgent();
    emailService.sendLoginAlert(user.getEmail(), user.getFullName(), ip, userAgent);

    return new GoogleAuthResponse(
            "AUTHENTICATED",
            token,
            email,
            user.getFullName(),
            user.getProfilePicture()
    );
}

/**
 * Step 2: Complete Google signup with role + phone.
 * Creates account and returns JWT (user is now logged in).
 */
@Override
public AuthResponse completeGoogleSignup(CompleteGoogleSignupRequest request) {
    // 1. Re-verify Google token (security)
    Payload payload = googleTokenVerifier.verify(request.getCredential());

    String email = payload.getEmail();
    String googleId = payload.getSubject();
    String name = (String) payload.get("name");
    String picture = (String) payload.get("picture");

    // 2. Double-check user still doesn't exist (defensive)
    if (userRepository.existsByEmail(email)) {
        throw new IllegalArgumentException(
                "An account with this email already exists. Please sign in.");
    }

    // 3. Fetch role
    Role role = roleRepository.findByRoleName(request.getRole())
            .orElseThrow(() -> new RuntimeException("Invalid role selected"));

    // 4. Create new user
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

    // 5. Send welcome email
    emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

    System.out.println("\n✨ NEW Google user completed signup: " + email +
            " (role: " + request.getRole() + ")\n");

    // 6. Generate JWT and log them in
    String token = jwtService.generateToken(email);

    // 7. Send login alert
    emailService.sendLoginAlert(user.getEmail(), user.getFullName(),
            getClientIp(), getUserAgent());

    return new AuthResponse(token);
}

    // ══════════════════════════════════════════════════════════════
    //  GOOGLE SIGN-IN
    // ══════════════════════════════════════════════════════════════

    /**
     * Handle Google Sign-In.
     * - If user exists → login → send login alert
     * - If new user → auto-create account → send welcome email
     */
    // ══════════════════════════════════════════════════════════════
    //  PASSWORD RESET FLOW (unchanged)
    // ══════════════════════════════════════════════════════════════

    @Override
    public ApiResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user != null) {
            // Block Google-only users (they don't have a password)
            if ("GOOGLE".equals(user.getAuthProvider())) {
                return new ApiResponse(false,
                    "This account uses Google Sign-In. Please continue with Google.");
            }

            String otp = generateOtp();
            user.setResetOtp(otp);
            user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            System.out.println("\n" + "━".repeat(50));
            System.out.println("🔐 PASSWORD RESET OTP");
            System.out.println("   Email:   " + user.getEmail());
            System.out.println("   OTP:     " + otp);
            System.out.println("━".repeat(50) + "\n");

            emailService.sendPasswordResetOtp(user.getEmail(), otp, user.getFullName());
        }

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

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return new ApiResponse(true, "Password reset successfully. You can now sign in.");
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
            // Pretty IPv6 localhost
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
}
