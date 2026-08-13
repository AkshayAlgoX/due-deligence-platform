// src/test/java/com/realestate/duediligence/controller/ReportControllerTest.java
package com.realestate.duediligence.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.dto.GenerateReportRequest;
import com.realestate.duediligence.dto.ReportSummaryDto;
import com.realestate.duediligence.enums.ReportStatus;
import com.realestate.duediligence.exception.GlobalExceptionHandler;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.security.JwtAuthenticationFilter;
import com.realestate.duediligence.security.RateLimitFilter;
import com.realestate.duediligence.security.RateLimitService;
import com.realestate.duediligence.security.SecurityConfig;
import com.realestate.duediligence.service.DueDiligenceReportService;
import com.realestate.duediligence.service.impl.CustomUserDetailsService;
import com.realestate.duediligence.util.JwtService;

/**
 * Web-layer tests for ReportController.
 * Real SecurityConfig + real filters (with mocked dependencies) so 401/200 paths both work.
 */
@WebMvcTest(ReportController.class)
@Import({SecurityConfig.class, ReportControllerTest.FilterBeans.class, GlobalExceptionHandler.class})
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DueDiligenceReportService reportService;

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
    void generate_returns202_withReportId() throws Exception {
        // Given — a valid generate request
        DueDiligenceReportResponse response = DueDiligenceReportResponse.builder()
                .id(1L)
                .propertyId(1L)
                .status(ReportStatus.PENDING)
                .build();
        when(reportService.generate(any(GenerateReportRequest.class))).thenReturn(response);

        // When / Then — accepted with the report shell
        mockMvc.perform(post("/api/reports/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"propertyId\":1,\"title\":\"Test Report\"}"))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser
    void list_returnsPageOfReports() throws Exception {
        // Given — an empty page for the user
        Page<ReportSummaryDto> page = new PageImpl<>(List.of());
        when(reportService.list(any(Pageable.class))).thenReturn(page);

        // When / Then
        mockMvc.perform(get("/api/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    @WithMockUser
    void getReport_returns200_withReportBody() throws Exception {
        // Given — an existing report
        when(reportService.getReport(5L)).thenReturn(
                DueDiligenceReportResponse.builder().id(5L).status(ReportStatus.COMPLETED).build());

        // When / Then
        mockMvc.perform(get("/api/reports/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5));
    }

    @Test
    @WithMockUser
    void delete_returns204_whenReportDeleted() throws Exception {
        // Given — void delete succeeds
        // When / Then
        mockMvc.perform(delete("/api/reports/5"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser
    void generate_returns400_whenBodyInvalid() throws Exception {
        // Given — missing the required propertyId
        // When / Then — validation failure maps to 400 via GlobalExceptionHandler
        mockMvc.perform(post("/api/reports/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void list_returns401_whenUnauthenticated() throws Exception {
        // Given — no credentials on a protected endpoint
        // When / Then
        mockMvc.perform(get("/api/reports"))
                .andExpect(status().isUnauthorized());
    }
}
