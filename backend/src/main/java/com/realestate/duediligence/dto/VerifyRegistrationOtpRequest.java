package com.realestate.duediligence.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Step 2 of the register-with-OTP flow.
 * Sent when user submits the 6-digit OTP.
 * On success, backend creates the real User account + returns JWT (auto-login).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyRegistrationOtpRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Verification code is required")
    @Pattern(regexp = "^\\d{6}$", message = "Verification code must be 6 digits")
    private String otp;
}