// src/test/java/com/realestate/duediligence/controller/ExportControllerTest.java
package com.realestate.duediligence.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
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

import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.security.JwtAuthenticationFilter;
import com.realestate.duediligence.security.RateLimitFilter;
import com.realestate.duediligence.security.RateLimitService;
import com.realestate.duediligence.security.SecurityConfig;
import com.realestate.duediligence.service.DueDiligenceReportService;
import com.realestate.duediligence.service.ExportService;
import com.realestate.duediligence.service.impl.CustomUserDetailsService;
import com.realestate.duediligence.util.JwtService;

/**
 * Web-layer tests for ExportController.
 * Real SecurityConfig + real filters (with mocked dependencies) so 401/200 paths both work.
 */
@WebMvcTest(ExportController.class)
@Import({SecurityConfig.class, ExportControllerTest.FilterBeans.class})
class ExportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private ExportService exportService;
    @MockitoBean private DueDiligenceReportService reportService;
    @MockitoBean private UserRepository userRepository;

    // Dependencies of the real filters (filters themselves are real, from FilterBeans)
    @MockitoBean private JwtService jwtService;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;
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

    @BeforeEach
    void setUp() {
        // Export endpoints pass through the real rate-limit filter — allow the request
        when(rateLimitService.tryExport(any())).thenReturn(true);

        User user = new User();
        user.setId(1L);
        user.setEmail("user");
        when(userRepository.findByEmail("user")).thenReturn(Optional.of(user));
    }

    @Test
    @WithMockUser
    void exportReportPdf_returns200_withPdfContent() throws Exception {
        // Given — service produces PDF bytes
        byte[] pdf = "%PDF-1.7 test content".getBytes(StandardCharsets.ISO_8859_1);
        when(exportService.exportReportPdf(5L, 1L)).thenReturn(pdf);

        // When / Then
        mockMvc.perform(get("/api/export/report/5/pdf"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(content().bytes(pdf));
    }

    @Test
    @WithMockUser
    void exportReportExcel_returns200_withXlsxContent() throws Exception {
        // Given — service produces XLSX bytes
        byte[] xlsx = "PK dummy xlsx".getBytes(StandardCharsets.ISO_8859_1);
        when(exportService.exportReportExcel(5L, 1L)).thenReturn(xlsx);

        // When / Then
        mockMvc.perform(get("/api/export/report/5/excel"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
    }

    @Test
    @WithMockUser
    void exportReportPdf_returns500_whenInvalidReportId() throws Exception {
        // Given — the export service rejects an unknown report
        when(exportService.exportReportPdf(99L, 1L))
                .thenThrow(new IllegalArgumentException("Report not found"));

        // When / Then — the controller catches the failure itself and returns 500
        mockMvc.perform(get("/api/export/report/99/pdf"))
                .andExpect(status().isInternalServerError());
    }
}
