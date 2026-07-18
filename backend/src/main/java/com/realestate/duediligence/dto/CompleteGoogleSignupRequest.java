package com.realestate.duediligence.dto;

import com.realestate.duediligence.enums.RoleType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CompleteGoogleSignupRequest {

    @NotBlank(message = "Google credential is required")
    private String credential;

    @NotNull(message = "Role is required")
    private RoleType role;

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^[6-9]\\d{9}$",
        message = "Phone number must be a valid 10-digit Indian mobile number"
    )
    private String phoneNumber;
}