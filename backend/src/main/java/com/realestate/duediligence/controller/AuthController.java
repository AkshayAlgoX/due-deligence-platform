package com.realestate.duediligence.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
import com.realestate.duediligence.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication",
        description = "Registration (email OTP), login (email/password + Google SSO), " +
                "password reset, profile management, and session management.")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // ── Registration ──────────────────────────────────────────────────────────

    @PostMapping("/register/send-otp")
    @Operation(
            summary = "Step 1 — Send registration OTP",
            description = "Validates the registration payload, creates a pending user record, and emails " +
                    "a 6-digit OTP to the provided address. The real User account is NOT created yet. " +
                    "Returns 409 if the email is already registered.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OTP sent — check email inbox"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failure (missing fields, invalid email format)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email already registered")
    })
    public SendOtpResponse sendRegistrationOtp(
            @Valid @RequestBody SendRegistrationOtpRequest request) {
        return userService.sendRegistrationOtp(request);
    }

    @PostMapping("/register/verify-otp")
    @Operation(
            summary = "Step 2 — Verify OTP and create account",
            description = "Validates the 6-digit OTP against the pending registration. On success the " +
                    "real User account is created, a JWT is returned, and the pending record is deleted. " +
                    "OTP expires after 10 minutes.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Account created — JWT returned in response body"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired OTP"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No pending registration found for this email")
    })
    public AuthResponse verifyRegistrationOtp(
            @Valid @RequestBody VerifyRegistrationOtpRequest request) {
        return userService.verifyRegistrationOtp(request);
    }

    @PostMapping("/register/resend-otp")
    @Operation(
            summary = "Step 2b — Resend registration OTP",
            description = "Generates and emails a fresh OTP to replace the previous one. " +
                    "Rate-limited: 60-second cooldown, max 3 resends per hour per email.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "New OTP sent"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Cooldown not yet elapsed or max resends exceeded"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No pending registration found for this email")
    })
    public SendOtpResponse resendRegistrationOtp(
            @Valid @RequestBody ResendRegistrationOtpRequest request) {
        return userService.resendRegistrationOtp(request);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @PostMapping("/login")
    @Operation(
            summary = "Log in with email and password",
            description = "Authenticates the user with email + password and returns a JWT. " +
                    "The token is valid for 1 hour (configurable via jwt.expiration). " +
                    "Also sends a login-alert email to the registered address.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Authentication successful — JWT returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failure (blank email or password)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Account is banned")
    })
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return userService.login(request);
    }

    @PostMapping("/google")
    @Operation(
            summary = "Sign in with Google (step 1)",
            description = "Verifies a Google ID token. If the Google account is already linked to a " +
                    "platform account, returns a JWT immediately. If the email is new, returns a " +
                    "partialToken that must be completed via /complete-google-signup.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Google token verified — JWT or partialToken returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired Google ID token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Token verification failed")
    })
    public GoogleAuthResponse loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return userService.loginWithGoogle(request);
    }

    @PostMapping("/complete-google-signup")
    @Operation(
            summary = "Complete Google sign-up (step 2)",
            description = "Completes a new Google account sign-up by supplying the role and phone number. " +
                    "Requires the partialToken returned from /google. Returns a full JWT on success.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Account created — full JWT returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid partialToken or missing required fields"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email already registered via a different provider")
    })
    public AuthResponse completeGoogleSignup(@Valid @RequestBody CompleteGoogleSignupRequest request) {
        return userService.completeGoogleSignup(request);
    }

    // ── Password Reset ────────────────────────────────────────────────────────

    @PostMapping("/forgot-password")
    @Operation(
            summary = "Request a password-reset OTP",
            description = "Sends a 6-digit OTP to the registered email address for password reset. " +
                    "Does not reveal whether the email is registered (always returns success).")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OTP sent if email is registered"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Missing or invalid email format")
    })
    public ApiResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return userService.forgotPassword(request);
    }

    @PostMapping("/verify-otp")
    @Operation(
            summary = "Verify password-reset OTP",
            description = "Validates the 6-digit OTP from /forgot-password. " +
                    "On success, a reset token is embedded in the response to authorize /reset-password.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "OTP verified — reset token returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid or expired OTP")
    })
    public ApiResponse verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return userService.verifyOtp(request);
    }

    @PostMapping("/reset-password")
    @Operation(
            summary = "Reset password with OTP-validated token",
            description = "Sets a new password using the token returned from /verify-otp. " +
                    "Password must be at least 8 characters.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid reset token, weak password, or token expired")
    })
    public ApiResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return userService.resetPassword(request);
    }

    // ── Account Management ────────────────────────────────────────────────────

    @DeleteMapping("/account")
    @Operation(
            summary = "Permanently delete account",
            description = "Irreversibly deletes the authenticated user's account, properties, reports, " +
                    "notifications, and all associated data. Requires password confirmation and the " +
                    "literal string \"DELETE\" as a safety acknowledgement.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Account deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Password confirmation failed or acknowledgement missing"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ApiResponse deleteAccount(
            @Valid @RequestBody DeleteAccountRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        if (principal == null) return new ApiResponse(false, "Not authenticated");
        return userService.deleteAccount(principal.getUsername(), request);
    }

    @GetMapping("/me")
    @Operation(
            summary = "Get current user profile",
            description = "Returns the full profile of the authenticated user. " +
                    "Used by the frontend after login to populate the profile page with fresh DB data.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public UserProfileResponse getCurrentUser(@AuthenticationPrincipal UserDetails principal) {
        if (principal == null) throw new RuntimeException("Not authenticated");
        return userService.getCurrentUserProfile(principal.getUsername());
    }

    @PutMapping("/me")
    @Operation(
            summary = "Update current user profile",
            description = "Updates the authenticated user's fullName, phoneNumber, and/or profile picture. " +
                    "Email, role, and password are not editable via this endpoint.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Profile updated — updated profile returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failure"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public UserProfileResponse updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        if (principal == null) throw new RuntimeException("Not authenticated");
        return userService.updateProfile(principal.getUsername(), request);
    }

    @PostMapping("/change-password")
    @Operation(
            summary = "Change password (authenticated)",
            description = "Changes the password for the currently authenticated user. " +
                    "Requires the current password for verification. " +
                    "Different from /forgot-password which is for lost access.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password changed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Current password incorrect, or new password too weak"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ApiResponse changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        if (principal == null) return new ApiResponse(false, "Not authenticated");
        return userService.changePassword(principal.getUsername(), request);
    }

    @PostMapping("/logout-all-devices")
    @Operation(
            summary = "Invalidate all sessions",
            description = "Advances the token_valid_from timestamp, invalidating all previously issued " +
                    "JWTs for this account. Use this if a token is suspected to be compromised.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "All sessions invalidated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ApiResponse logoutAllDevices(@AuthenticationPrincipal UserDetails principal) {
        if (principal == null) return new ApiResponse(false, "Not authenticated");
        return userService.logoutAllDevices(principal.getUsername());
    }
}
