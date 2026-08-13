// src/test/java/com/realestate/duediligence/integration/FullReportFlowIT.java
package com.realestate.duediligence.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.client.RestTemplate;

import com.realestate.duediligence.aggregation.AggregatedPropertyResponse;
import com.realestate.duediligence.aggregation.PropertyAggregationService;
import com.realestate.duediligence.entity.Role;
import com.realestate.duediligence.enums.RoleType;
import com.realestate.duediligence.repository.RoleRepository;
import com.realestate.duediligence.service.EmailService;

/**
 * Full system test — real Spring context, H2 DB, random port, real HTTP.
 *
 * External integrations are replaced:
 *  - EmailService         → mocked (OTP captured from the send call)
 *  - AddressValidation    → mocked (avoids external geocoding)
 *  - PropertyAggregation  → mocked (deterministic risk scoring, no provider network calls)
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class FullReportFlowIT {

    private static final AtomicInteger SEQ = new AtomicInteger();

    @Value("${local.server.port}")
    private int port;

    private RestTemplate rest;

    @Autowired
    private RoleRepository roleRepository;

    @MockitoBean
    private EmailService emailService;

    @MockitoBean
    private AddressValidationService addressValidationService;

    @MockitoBean
    private PropertyAggregationService propertyAggregationService;

    private String email;

    @BeforeEach
    void setUp() {
        rest = new RestTemplate();
        email = "it-user-" + SEQ.incrementAndGet() + "@test.com";

        // Seed the BUYER role — OTP verification resolves it from the DB
        if (roleRepository.findByRoleName(RoleType.BUYER).isEmpty()) {
            Role role = new Role();
            role.setRoleName(RoleType.BUYER);
            roleRepository.save(role);
        }

        // Deterministic stubs: no external calls during tests
        when(addressValidationService.validateAddress(any())).thenReturn(true);
        when(propertyAggregationService.aggregate(any()))
                .thenReturn(AggregatedPropertyResponse.builder().build());
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    // ── Helper: full OTP registration, returns a fresh JWT ──────────

    private String registerAndGetToken(String fullName, String password) {
        Map<String, Object> sendReq = new HashMap<>();
        sendReq.put("fullName", fullName);
        sendReq.put("email", email);
        sendReq.put("password", password);
        sendReq.put("phoneNumber", "9876543210");
        sendReq.put("role", "BUYER");

        ResponseEntity<Map> sendRes =
                rest.postForEntity(url("/api/auth/register/send-otp"), sendReq, Map.class);
        assertThat(sendRes.getStatusCode().value()).isEqualTo(200);

        // OTP never leaves the server — capture it from the mocked email service
        ArgumentCaptor<String> otpCaptor = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendRegistrationOtp(eq(email), otpCaptor.capture(), any());
        String otp = otpCaptor.getValue();
        assertThat(otp).hasSize(6);

        Map<String, Object> verifyReq = new HashMap<>();
        verifyReq.put("email", email);
        verifyReq.put("otp", otp);

        ResponseEntity<Map> verifyRes =
                rest.postForEntity(url("/api/auth/register/verify-otp"), verifyReq, Map.class);
        assertThat(verifyRes.getStatusCode().value()).isEqualTo(200);
        String token = (String) verifyRes.getBody().get("token");
        assertThat(token).isNotBlank();
        return token;
    }

    private HttpHeaders bearer(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return headers;
    }

    // ── Test 1: property → report → risk score ──────────────────────

    @Test
    void fullPropertyReportFlow_returnsRiskAssessment() {
        // Given — a registered, authenticated buyer
        String token = registerAndGetToken("Flow Tester", "Password@123");
        HttpHeaders headers = bearer(token);

        // When — create a property
        Map<String, Object> propReq = new HashMap<>();
        propReq.put("address", "42 MG Road, Indiranagar");
        propReq.put("city", "Bengaluru");
        propReq.put("state", "Karnataka");
        propReq.put("zipCode", "560038");

        ResponseEntity<Map> propRes = rest.exchange(url("/api/properties"), HttpMethod.POST,
                new HttpEntity<>(propReq, headers), Map.class);
        assertThat(propRes.getStatusCode().value()).isEqualTo(200);
        Number propertyId = (Number) propRes.getBody().get("id");
        assertThat(propertyId).isNotNull();

        // When — generate a report for it
        Map<String, Object> genReq = new HashMap<>();
        genReq.put("propertyId", propertyId);
        ResponseEntity<Map> genRes = rest.exchange(url("/api/reports/generate"), HttpMethod.POST,
                new HttpEntity<>(genReq, headers), Map.class);
        assertThat(genRes.getStatusCode().value()).isEqualTo(202);
        Number reportId = (Number) genRes.getBody().get("id");
        assertThat(reportId).isNotNull();

        // Then — the report is fetchable by its owner
        ResponseEntity<Map> reportRes = rest.exchange(url("/api/reports/" + reportId),
                HttpMethod.GET, new HttpEntity<>(headers), Map.class);
        assertThat(reportRes.getStatusCode().value()).isEqualTo(200);
        assertThat(reportRes.getBody().get("id")).isEqualTo(reportId);

        // And — the risk assessment is computed within 0..100 with a valid level
        ResponseEntity<Map> riskRes = rest.exchange(url("/api/properties/" + propertyId + "/risk"),
                HttpMethod.GET, new HttpEntity<>(headers), Map.class);
        assertThat(riskRes.getStatusCode().value()).isEqualTo(200);
        double score = ((Number) riskRes.getBody().get("overallScore")).doubleValue();
        assertThat(score).isBetween(0.0, 100.0);
        assertThat((String) riskRes.getBody().get("overallLevel"))
                .isIn("LOW", "MEDIUM", "HIGH", "CRITICAL");
    }

    // ── Test 2: register → login → authenticated reports access ─────

    @Test
    void registerLoginAndAccessReports_withJwtToken() {
        // Given — an account created via the OTP flow
        registerAndGetToken("Auth Tester", "Password@456");

        // When — logging in with the same credentials
        Map<String, Object> loginReq = new HashMap<>();
        loginReq.put("email", email);
        loginReq.put("password", "Password@456");
        ResponseEntity<Map> loginRes =
                rest.postForEntity(url("/api/auth/login"), loginReq, Map.class);
        assertThat(loginRes.getStatusCode().value()).isEqualTo(200);
        String token = (String) loginRes.getBody().get("token");
        assertThat(token).isNotBlank();

        // Then — the JWT grants access to the reports list
        ResponseEntity<Map> reportsRes = rest.exchange(url("/api/reports"), HttpMethod.GET,
                new HttpEntity<>(bearer(token)), Map.class);
        assertThat(reportsRes.getStatusCode().value()).isEqualTo(200);
        assertThat(reportsRes.getBody()).containsKey("content");
    }
}
