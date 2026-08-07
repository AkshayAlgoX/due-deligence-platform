package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for reading or updating notification preferences.
 * All fields are booleans matching the preference matrix.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceDto {

    private boolean reportReadyEmail;
    private boolean reportReadyInApp;

    private boolean riskAlertEmail;
    private boolean riskAlertInApp;

    private boolean priceChangeEmail;
    private boolean priceChangeInApp;

    private boolean systemEmail;
    private boolean systemInApp;
}
