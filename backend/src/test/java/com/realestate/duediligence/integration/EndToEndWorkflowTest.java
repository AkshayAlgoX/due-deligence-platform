package com.realestate.duediligence.integration;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

import com.realestate.duediligence.dto.AuthResponse;
import com.realestate.duediligence.dto.LoginRequest;
import com.realestate.duediligence.dto.SendOtpResponse;
import com.realestate.duediligence.dto.SendRegistrationOtpRequest;
import com.realestate.duediligence.dto.VerifyRegistrationOtpRequest;
import com.realestate.duediligence.entity.PendingRegistration;
import com.realestate.duediligence.enums.RoleType;
import com.realestate.duediligence.repository.PendingRegistrationRepository;
import com.realestate.duediligence.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class EndToEndWorkflowTest {

    @LocalServerPort
    private int port;

    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private PendingRegistrationRepository pendingRegistrationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    private String authUrl() {
        return "http://localhost:" + port + "/api/auth";
    }

    @Test
    void workflow1_registerVerifyThenLoginSucceeds() {

        String testEmail =
                "e2e-workflow-" + System.currentTimeMillis() + "@example.com";

        String testPassword = "TestPass123";
        String knownOtp = "123456";

        // ---------------------------------------------------------
        // CLEANUP BEFORE TEST
        // ---------------------------------------------------------

        pendingRegistrationRepository.deleteByEmail(testEmail);

        userRepository.findByEmail(testEmail)
                .ifPresent(userRepository::delete);

        // ---------------------------------------------------------
        // STEP 1: SEND REGISTRATION OTP
        // ---------------------------------------------------------

        SendRegistrationOtpRequest sendRequest =
                new SendRegistrationOtpRequest();

        sendRequest.setFullName("E2E Test User");
        sendRequest.setEmail(testEmail);
        sendRequest.setPassword(testPassword);
        sendRequest.setPhoneNumber("9876543210");
        sendRequest.setRole(RoleType.BUYER);

        ResponseEntity<SendOtpResponse> sendResponse =
                restTemplate.postForEntity(
                        authUrl() + "/register/send-otp",
                        sendRequest,
                        SendOtpResponse.class
                );

        assertEquals(
                HttpStatus.OK,
                sendResponse.getStatusCode(),
                "Registration OTP request should return HTTP 200"
        );

        // ---------------------------------------------------------
        // STEP 2: GET PENDING REGISTRATION
        // ---------------------------------------------------------

        PendingRegistration pending =
                pendingRegistrationRepository
                        .findByEmail(testEmail)
                        .orElseThrow(() ->
                                new AssertionError(
                                        "PendingRegistration row was not created"
                                )
                        );

        // ---------------------------------------------------------
        // STEP 3: SET KNOWN OTP
        //
        // The real application generates/sends an OTP.
        // For deterministic testing, replace the OTP hash with
        // a known value.
        // ---------------------------------------------------------

        pending.setOtpHash(
                passwordEncoder.encode(knownOtp)
        );

        pending.setOtpExpiresAt(
                LocalDateTime.now().plusMinutes(10)
        );

        pendingRegistrationRepository.save(pending);

        // ---------------------------------------------------------
        // STEP 4: VERIFY REGISTRATION OTP
        // ---------------------------------------------------------

        VerifyRegistrationOtpRequest verifyRequest =
                new VerifyRegistrationOtpRequest();

        verifyRequest.setEmail(testEmail);
        verifyRequest.setOtp(knownOtp);

        ResponseEntity<AuthResponse> verifyResponse =
                restTemplate.postForEntity(
                        authUrl() + "/register/verify-otp",
                        verifyRequest,
                        AuthResponse.class
                );

        assertEquals(
                HttpStatus.OK,
                verifyResponse.getStatusCode(),
                "OTP verification should return HTTP 200"
        );

        assertNotNull(
                verifyResponse.getBody(),
                "OTP verification response body should not be null"
        );

        assertNotNull(
                verifyResponse.getBody().getToken(),
                "JWT token should be returned after OTP verification"
        );

        // ---------------------------------------------------------
        // STEP 5: VERIFY USER WAS CREATED
        // ---------------------------------------------------------

        assertTrue(
                userRepository.existsByEmail(testEmail),
                "User should exist after successful registration"
        );

        // Pending registration should be removed after verification
        assertFalse(
                pendingRegistrationRepository.existsByEmail(testEmail),
                "Pending registration should be deleted after verification"
        );

        // ---------------------------------------------------------
        // STEP 6: LOGIN
        // ---------------------------------------------------------

        LoginRequest loginRequest = new LoginRequest();

        loginRequest.setEmail(testEmail);
        loginRequest.setPassword(testPassword);

        ResponseEntity<AuthResponse> loginResponse =
                restTemplate.postForEntity(
                        authUrl() + "/login",
                        loginRequest,
                        AuthResponse.class
                );

        assertEquals(
                HttpStatus.OK,
                loginResponse.getStatusCode(),
                "Login should return HTTP 200"
        );

        assertNotNull(
                loginResponse.getBody(),
                "Login response body should not be null"
        );

        assertNotNull(
                loginResponse.getBody().getToken(),
                "JWT token should be returned after successful login"
        );

        // ---------------------------------------------------------
        // STEP 7: CLEANUP
        // ---------------------------------------------------------

        
    }

    // Future E2E workflows:
    //
    // workflow2_addPropertyThenRiskAnalysis()
    //
    // workflow3_comparePropertiesThenSaveComparison()
    //
    // workflow4_generateReportThenDownload()
    //
    // workflow5_adminViewsAuditLog()
}