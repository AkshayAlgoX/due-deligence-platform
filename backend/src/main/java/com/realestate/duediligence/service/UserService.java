package com.realestate.duediligence.service;

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
import com.realestate.duediligence.dto.UserProfileResponse;

public interface UserService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    ApiResponse forgotPassword(ForgotPasswordRequest request);

    ApiResponse verifyOtp(VerifyOtpRequest request);

    ApiResponse resetPassword(ResetPasswordRequest request);

    // ── Google Sign-In (2-step flow) ──
    GoogleAuthResponse loginWithGoogle(GoogleLoginRequest request);

    AuthResponse completeGoogleSignup(CompleteGoogleSignupRequest request);

    // ── NEW: Account deletion ──
    ApiResponse deleteAccount(String email, DeleteAccountRequest request);
    // Add this method signature at the end
UserProfileResponse getCurrentUserProfile(String email);
}