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
import com.realestate.duediligence.dto.RegisterRequest;
import com.realestate.duediligence.dto.ResetPasswordRequest;
import com.realestate.duediligence.dto.UpdateProfileRequest;
import com.realestate.duediligence.dto.UserProfileResponse;
import com.realestate.duediligence.dto.VerifyOtpRequest;
import com.realestate.duediligence.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return userService.login(request);
    }

    // ── Google Sign-In (2-step) ──
    @PostMapping("/google")
    public GoogleAuthResponse loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return userService.loginWithGoogle(request);
    }

    @PostMapping("/complete-google-signup")
    public AuthResponse completeGoogleSignup(@Valid @RequestBody CompleteGoogleSignupRequest request) {
        return userService.completeGoogleSignup(request);
    }

    // ── Password Reset ──
    @PostMapping("/forgot-password")
    public ApiResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return userService.forgotPassword(request);
    }

    @PostMapping("/verify-otp")
    public ApiResponse verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return userService.verifyOtp(request);
    }

    @PostMapping("/reset-password")
    public ApiResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return userService.resetPassword(request);
    }

    // ══════════════════════════════════════════════════════════════
    //  ACCOUNT DELETION (NEW)
    // ══════════════════════════════════════════════════════════════

    /**
     * DELETE /api/auth/account
     * Permanently delete the currently authenticated user's account.
     * Requires password confirmation + typing "DELETE".
     */
    @DeleteMapping("/account")
    public ApiResponse deleteAccount(
            @Valid @RequestBody DeleteAccountRequest request,
            @AuthenticationPrincipal UserDetails principal) {

        if (principal == null) {
            return new ApiResponse(false, "Not authenticated");
        }

        return userService.deleteAccount(principal.getUsername(), request);
    }

    // ── inside AuthController class ──

/**
 * GET /api/auth/me
 * Returns full profile of the currently authenticated user.
 * Used by the profile page to display fresh data (not stale JWT contents).
 */
@GetMapping("/me")
public UserProfileResponse getCurrentUser(
        @AuthenticationPrincipal UserDetails principal) {
    if (principal == null) {
        throw new RuntimeException("Not authenticated");
    }
    return userService.getCurrentUserProfile(principal.getUsername());
}
    /**
     * PUT /api/auth/me
     * Update the current user's profile (fullName, phoneNumber only).
     * Email, role, password are NOT editable here.
     */
    @PutMapping("/me")
    public UserProfileResponse updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        if (principal == null) {
            throw new RuntimeException("Not authenticated");
        }
        return userService.updateProfile(principal.getUsername(), request);
    }

    /**
     * POST /api/auth/change-password
     * Authenticated password change (user knows their current password).
     * Different from /forgot-password (which is for lost access).
     */
    @PostMapping("/change-password")
    public ApiResponse changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        if (principal == null) {
            return new ApiResponse(false, "Not authenticated");
        }
        return userService.changePassword(principal.getUsername(), request);
    }
}