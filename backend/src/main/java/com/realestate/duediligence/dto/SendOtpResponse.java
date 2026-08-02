package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response after successfully sending / resending a registration OTP.
 * Tells the frontend how long the client must wait before allowing a resend.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendOtpResponse {

    private boolean success;

    private String message;

    /** Masked email like "j***@gmail.com" — used in the OTP modal display. */
    private String maskedEmail;

    /** Seconds before the resend button can be clicked again. */
    private int resendCooldownSeconds;

    /** Seconds until the OTP itself expires. */
    private int expiresInSeconds;
}