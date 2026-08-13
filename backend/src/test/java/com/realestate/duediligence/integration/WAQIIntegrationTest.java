package com.realestate.duediligence.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.realestate.duediligence.dto.IntegrationHealthStatus;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class WAQIIntegrationTest {

    @Autowired
    private WAQIHealthCheck waqiHealthCheck;

    @Test
    void checkReturnsUpWhenWaqiIsReachable() {
        IntegrationHealthStatus result = waqiHealthCheck.check();

        assertNotNull(result);
        assertNotNull(result.status());
        assertTrue(result.status().equals("UP") || result.status().equals("DOWN"));
        assertTrue(result.responseTimeMs() >= 0);
        assertNotNull(result.checkedAt());
    }
}