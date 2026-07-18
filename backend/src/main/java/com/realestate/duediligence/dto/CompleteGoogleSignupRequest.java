package com.realestate.duediligence.dto;

import com.realestate.duediligence.enums.RoleType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CompleteGoogleSignupRequest {

    /** Google ID token (JWT) — re-verified for security */
    @NotBlank(message = "Google credential is required")
    private String credential;

    /** User-selected role (Buyer / Agent / Legal / Financial / Admin) */
    @NotNull(message = "Role is required")
    private RoleType role;

    /** Phone number (Indian format) */
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Phone must be a valid 10-digit Indian number")
    private String phoneNumber;
}