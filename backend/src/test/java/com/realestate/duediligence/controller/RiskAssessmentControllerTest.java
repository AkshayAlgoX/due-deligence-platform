// src/test/java/com/realestate/duediligence/controller/RiskAssessmentControllerTest.java
package com.realestate.duediligence.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.realestate.duediligence.dto.RiskAssessmentResponse;
import com.realestate.duediligence.dto.RiskBreakdownDto;
import com.realestate.duediligence.dto.RiskHistoryDto;
import com.realestate.duediligence.enums.RiskLevel;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.security.JwtAuthenticationFilter;
import com.realestate.duediligence.security.RateLimitFilter;
import com.realestate.duediligence.security.RateLimitService;
import com.realestate.duediligence.security.SecurityConfig;
import com.realestate.duediligence.service.RiskAssessmentService;
import com.realestate.duediligence.service.impl.CustomUserDetailsService;
import com.realestate.duediligence.util.JwtService;

/**
 * Web-layer tests for RiskAssessmentController.
 * Real SecurityConfig + real filters (with mocked dependencies) so 401/200 paths both work.
 */
@WebMvcTest(RiskAssessmentController.class)
@Import({SecurityConfig.class, RiskAssessmentControllerTest.FilterBeans.class})
class RiskAssessmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RiskAssessmentService riskAssessmentService;

    // Dependencies of the real filters (filters themselves are real, from FilterBeans)
    @MockitoBean private JwtService jwtService;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;
    @MockitoBean private UserRepository userRepository;
    @MockitoBean private RateLimitService rateLimitService;

    // @EnableCaching on the app class needs a CacheManager — slices don't auto-configure one
    @MockitoBean private org.springframework.cache.CacheManager cacheManager;

    @TestConfiguration(proxyBeanMethods = false)
    static class FilterBeans {
        @Bean
        JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService,
                CustomUserDetailsService userDetailsService, UserRepository userRepository) {
            return new JwtAuthenticationFilter(jwtService, userDetailsService, userRepository);
        }

        @Bean
        RateLimitFilter rateLimitFilter(RateLimitService rateLimitService) {
            return new RateLimitFilter(rateLimitService);
        }
    }

    @Test
    @WithMockUser
    void getRisk_returns200_withScoreAndLevel() throws Exception {
        // Given — service returns a HIGH assessment
        RiskAssessmentResponse response = RiskAssessmentResponse.builder()
                .assessmentId(9L)
                .propertyId(1L)
                .overallScore(85.0)
                .overallLevel(RiskLevel.HIGH)
                .summary("High risk property")
                .freshlyComputed(true)
                .build();
        when(riskAssessmentService.getOrCompute(1L)).thenReturn(response);

        // When / Then
        mockMvc.perform(get("/api/properties/1/risk"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.overallScore").value(85.0))
                .andExpect(jsonPath("$.overallLevel").value("HIGH"))
                .andExpect(jsonPath("$.assessmentId").value(9));
    }

    @Test
    void getRisk_returns401_whenUnauthenticated() throws Exception {
        // Given — no credentials on a protected endpoint
        // When / Then
        mockMvc.perform(get("/api/properties/1/risk"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void getHistory_returns200_withAssessmentCount() throws Exception {
        // Given — a property with no assessment history
        RiskHistoryDto history = RiskHistoryDto.builder()
                .propertyId(1L)
                .totalAssessments(0)
                .build();
        when(riskAssessmentService.getHistory(1L)).thenReturn(history);

        // When / Then
        mockMvc.perform(get("/api/properties/1/risk/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAssessments").value(0));
    }

    @Test
    @WithMockUser
    void getRisk_returns404_whenServiceThrows() throws Exception {
        // Given — property does not exist
        when(riskAssessmentService.getOrCompute(1L))
                .thenThrow(new RuntimeException("Property not found: 1"));

        // When / Then — controller maps RuntimeException to 404
        mockMvc.perform(get("/api/properties/1/risk"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void getBreakdown_returns200_withOverallScore() throws Exception {
        // Given — a LOW breakdown
        RiskBreakdownDto breakdown = RiskBreakdownDto.builder()
                .propertyId(1L)
                .overallScore(23.5)
                .overallLevel(RiskLevel.LOW)
                .build();
        when(riskAssessmentService.getBreakdown(1L)).thenReturn(breakdown);

        // When / Then
        mockMvc.perform(get("/api/properties/1/risk/breakdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallScore").value(23.5))
                .andExpect(jsonPath("$.overallLevel").value("LOW"));
    }
}
