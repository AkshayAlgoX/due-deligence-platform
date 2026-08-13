package com.realestate.duediligence.actuator;

import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.stereotype.Component;

import com.realestate.duediligence.dto.IntegrationHealthStatus;
import com.realestate.duediligence.integration.GoogleOAuthHealthCheck;
import com.realestate.duediligence.integration.NominatimHealthCheck;
import com.realestate.duediligence.integration.WAQIHealthCheck;

import lombok.RequiredArgsConstructor;

@Component("externalIntegrations")
@RequiredArgsConstructor
public class CustomHealthIndicator implements HealthIndicator {

    private final WAQIHealthCheck waqiHealthCheck;
    private final NominatimHealthCheck nominatimHealthCheck;
    private final GoogleOAuthHealthCheck googleOAuthHealthCheck;

    @Override
    public Health health() {

        IntegrationHealthStatus waqi =
                waqiHealthCheck.check();

        IntegrationHealthStatus nominatim =
                nominatimHealthCheck.check();

        IntegrationHealthStatus google =
                googleOAuthHealthCheck.check();

        boolean allUp =
                "UP".equals(waqi.status())
                        && "UP".equals(nominatim.status())
                        && "UP".equals(google.status());

        if (allUp) {
            return Health.up()
                    .withDetail("waqi", waqi)
                    .withDetail("nominatim", nominatim)
                    .withDetail("googleOAuth", google)
                    .build();
        }

        return Health.down()
                .withDetail("waqi", waqi)
                .withDetail("nominatim", nominatim)
                .withDetail("googleOAuth", google)
                .build();
    }
}