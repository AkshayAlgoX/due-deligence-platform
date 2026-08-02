package com.realestate.duediligence.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Resend a fresh OTP for an existing PendingRegistration.
 * Rate-limited on backend: max 3 resends per hour, 60s cooldown between resends.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResendRegistrationOtpRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
}