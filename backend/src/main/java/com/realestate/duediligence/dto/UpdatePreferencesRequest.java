package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for PUT /api/notifications/preferences.
 * Mirrors NotificationPreferenceDto — kept as a separate class
 * to allow independent validation annotations in the future.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePreferencesRequest {

    private boolean reportReadyEmail;
    private boolean reportReadyInApp;

    private boolean riskAlertEmail;
    private boolean riskAlertInApp;

    private boolean priceChangeEmail;
    private boolean priceChangeInApp;

    private boolean systemEmail;
    private boolean systemInApp;
}
