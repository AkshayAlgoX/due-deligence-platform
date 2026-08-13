package com.realestate.duediligence.integration;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.IntegrationHealthStatus;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthCheckController {

    private final WAQIHealthCheck waqiHealthCheck;
    private final NominatimHealthCheck nominatimHealthCheck;
    private final GoogleOAuthHealthCheck googleOAuthHealthCheck;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/integrations")
    public List<IntegrationHealthStatus> checkAllIntegrations() {
        return List.of(
                waqiHealthCheck.check(),
                nominatimHealthCheck.check(),
                googleOAuthHealthCheck.check()
        );
    }
}