// src/test/java/com/realestate/duediligence/service/impl/DueDiligenceReportServiceImplTest.java
package com.realestate.duediligence.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.dto.GenerateReportRequest;
import com.realestate.duediligence.dto.ReportSummaryDto;
import com.realestate.duediligence.entity.DueDiligenceReport;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.Role;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.ReportStatus;
import com.realestate.duediligence.enums.RoleType;
import com.realestate.duediligence.repository.DueDiligenceReportRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.ReportSectionRepository;
import com.realestate.duediligence.repository.SubscriptionRepository;
import com.realestate.duediligence.repository.UserRepository;

/**
 * Unit tests for DueDiligenceReportServiceImpl.
 * Covers generate, status, fetch, list, delete and auth failures.
 */
@ExtendWith(MockitoExtension.class)
class DueDiligenceReportServiceImplTest {

    @Mock private DueDiligenceReportRepository reportRepository;
    @Mock private ReportSectionRepository sectionRepository;
    @Mock private PropertyRepository propertyRepository;
    @Mock private UserRepository userRepository;
    @Mock private ReportGenerationExecutor executor;
    @Mock private SubscriptionRepository subscriptionRepository;

    @InjectMocks
    private DueDiligenceReportServiceImpl service;

    private User user;
    private Property property;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(10L);
        user.setEmail("buyer@test.com");
        Role role = new Role();
        role.setRoleName(RoleType.BUYER);
        user.setRole(role);

        property = new Property();
        property.setId(1L);
        // generate() rejects properties the authenticated user doesn't own (RBAC),
        // so mark the buyer as the owner to let should_generateReport_* pass the gate.
        property.setCreatedBy(user);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAsBuyer() {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(
                        "buyer@test.com", null, List.of()));
    }

    private DueDiligenceReport ownedReport(long id, ReportStatus status) {
        return DueDiligenceReport.builder()
                .id(id)
                .property(property)
                .generatedBy(user)
                .title("Test Report")
                .status(status)
                .build();
    }

    // ── generate ────────────────────────────────────────────────────

    @Test
    void should_generateReport_andReturnPendingReport() {
        // Given — authenticated buyer under the free-plan limit
        authenticateAsBuyer();
        GenerateReportRequest request = GenerateReportRequest.builder()
                .propertyId(1L).title("Test Report").build();
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(reportRepository.findMaxVersionByPropertyId(1L)).thenReturn(0);
        when(reportRepository.findByPropertyIdOrderByVersionDesc(1L)).thenReturn(List.of());
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(user));
        when(subscriptionRepository.findFirstByUserIdOrderByCreatedAtDesc(10L))
                .thenReturn(Optional.empty());
        when(reportRepository.countByGeneratedByIdAndCreatedAtAfter(
                eq(10L), any(LocalDateTime.class))).thenReturn(0L);
        when(reportRepository.save(any(DueDiligenceReport.class))).thenAnswer(inv -> {
            inv.<DueDiligenceReport>getArgument(0).setId(50L);
            return inv.getArgument(0);
        });

        // When — no real transaction in a unit test, so the afterCommit
        // registration must be neutralised
        try (MockedStatic<TransactionSynchronizationManager> tsm =
                mockStatic(TransactionSynchronizationManager.class)) {
            DueDiligenceReportResponse response = service.generate(request);

            // Then — persisted shell returned as PENDING
            assertThat(response.getId()).isEqualTo(50L);
            assertThat(response.getStatus()).isEqualTo(ReportStatus.PENDING);
        }
        verify(reportRepository).save(any(DueDiligenceReport.class));
    }

    @Test
    void should_throw_whenPropertyNotFoundOnGenerate() {
        // Given — authenticated, but the property does not exist
        authenticateAsBuyer();
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(user));
        GenerateReportRequest request = GenerateReportRequest.builder()
                .propertyId(999L).build();
        when(propertyRepository.findById(999L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> service.generate(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Property not found: 999");
    }

    @Test
    void should_throwAuthenticationRequired_whenNoSecurityContext() {
        // Given — no authentication in the security context (generate checks auth first)
        GenerateReportRequest request = GenerateReportRequest.builder().propertyId(1L).build();

        // When / Then
        assertThatThrownBy(() -> service.generate(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Authentication required");
    }

    // ── getStatus / getReport ───────────────────────────────────────

    @Test
    void should_returnStatus_whenOwnerRequestsIt() {
        // Given — an owned report
        authenticateAsBuyer();
        DueDiligenceReport report = ownedReport(5L, ReportStatus.PENDING);
        when(reportRepository.findById(5L)).thenReturn(Optional.of(report));
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(user));

        // When
        ReportStatus status = service.getStatus(5L);

        // Then
        assertThat(status).isEqualTo(ReportStatus.PENDING);
    }

    @Test
    void should_returnReportWithSections_whenOwnerFetchesIt() {
        // Given — an owned report without sections
        authenticateAsBuyer();
        DueDiligenceReport report = ownedReport(5L, ReportStatus.COMPLETED);
        when(reportRepository.findById(5L)).thenReturn(Optional.of(report));
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(user));
        when(sectionRepository.findByReportIdOrderByOrderIndexAsc(5L)).thenReturn(List.of());

        // When
        DueDiligenceReportResponse response = service.getReport(5L);

        // Then
        assertThat(response.getId()).isEqualTo(5L);
        assertThat(response.getSections()).isEmpty();
    }

    // ── list ────────────────────────────────────────────────────────

    @Test
    void should_listOnlyOwnedReports_forBuyer() {
        // Given — non-admin buyer with an empty report list
        authenticateAsBuyer();
        PageRequest pageable = PageRequest.of(0, 10);
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(user));
        when(reportRepository.findByGeneratedByIdOrderByCreatedAtDesc(10L, pageable))
                .thenReturn(Page.empty(pageable));

        // When
        Page<ReportSummaryDto> result = service.list(pageable);

        // Then — user-scoped repository used
        assertThat(result.getTotalElements()).isZero();
        verify(reportRepository).findByGeneratedByIdOrderByCreatedAtDesc(10L, pageable);
    }

    // ── delete ──────────────────────────────────────────────────────

    @Test
    void should_deleteReport_whenOwnerRequestsIt() {
        // Given — an owned report
        authenticateAsBuyer();
        DueDiligenceReport report = ownedReport(5L, ReportStatus.COMPLETED);
        when(reportRepository.findById(5L)).thenReturn(Optional.of(report));
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(user));

        // When
        service.delete(5L);

        // Then
        verify(reportRepository).delete(report);
    }
}
