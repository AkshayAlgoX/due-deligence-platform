// src/test/java/com/realestate/duediligence/service/impl/RiskAssessmentServiceImplTest.java
package com.realestate.duediligence.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.lenient;
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
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.realestate.duediligence.dto.RiskAssessmentResponse;
import com.realestate.duediligence.dto.RiskBreakdownDto;
import com.realestate.duediligence.dto.RiskHistoryDto;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.RiskAssessment;
import com.realestate.duediligence.entity.RiskFactor;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.RiskCategory;
import com.realestate.duediligence.enums.RiskLevel;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.RiskAssessmentRepository;
import com.realestate.duediligence.repository.RiskFactorRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.RiskScoringEngine;
import com.realestate.duediligence.service.RiskScoringEngine.EngineResult;

/**
 * Unit tests for RiskAssessmentServiceImpl.
 * Covers score retrieval, compute-and-persist, recalc, breakdown, history and null-safety.
 */
@ExtendWith(MockitoExtension.class)
class RiskAssessmentServiceImplTest {

    @Mock private RiskScoringEngine scoringEngine;
    @Mock private RiskAssessmentRepository assessmentRepository;
    @Mock private RiskFactorRepository factorRepository;
    @Mock private PropertyRepository propertyRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private RiskAssessmentServiceImpl service;

    private User user;
    private Property property;
    private RiskAssessment assessment;

    @BeforeEach
    void setUp() {
        // authorizeProperty() resolves the current user from the security context and
        // passes only if they own the property (or hold a view-all role). Authenticate
        // the owner so the score/compute/breakdown/history tests — which don't exercise
        // auth — can get past the RBAC gate.
        user = new User();
        user.setId(5L);
        user.setEmail("buyer@test.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user.getEmail(), null, List.of()));
        lenient().when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        property = new Property();
        property.setId(1L);
        property.setCreatedBy(user);

        lenient().when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        assessment = RiskAssessment.builder()
                .overallScore(23.0)
                .overallLevel(RiskLevel.LOW)
                .floodScore(10.0)
                .legalScore(20.0)
                .taxScore(0.0)
                .zoningScore(5.0)
                .environmentalScore(15.0)
                .marketScore(10.0)
                .summary("Low risk summary")
                .isLatest(true)
                .calculatedAt(LocalDateTime.of(2026, 8, 1, 10, 0))
                .build();
        assessment.setId(10L);
        assessment.setProperty(property);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private RiskFactor factor(RiskCategory category, double score) {
        return RiskFactor.builder()
                .category(category)
                .score(score)
                .level(RiskLevel.fromScore(score))
                .weight(0.20)
                .explanation("Explanation for " + category)
                .recommendation("Recommendation for " + category)
                .dataSource("TEST_SOURCE")
                .build();
    }

    // ── getOrCompute ────────────────────────────────────────────────

    @Test
    void should_returnExistingAssessment_whenLatestExists() {
        // Given — a persisted latest assessment
        when(assessmentRepository.findByPropertyIdAndIsLatestTrue(1L))
                .thenReturn(Optional.of(assessment));

        // When
        RiskAssessmentResponse response = service.getOrCompute(1L);

        // Then — cached entity mapped without recompute
        assertThat(response.getAssessmentId()).isEqualTo(10L);
        assertThat(response.getOverallScore()).isEqualTo(23.0);
        assertThat(response.getOverallLevel()).isEqualTo(RiskLevel.LOW);
        assertThat(response.isFreshlyComputed()).isFalse();
    }

    @Test
    void should_computeAndPersist_whenNoAssessmentExists() {
        // Given — nothing cached, engine produces a fresh result
        RiskAssessment fresh = RiskAssessment.builder()
                .overallScore(42.0)
                .overallLevel(RiskLevel.MEDIUM)
                .isLatest(true)
                .build();
        when(assessmentRepository.findByPropertyIdAndIsLatestTrue(1L))
                .thenReturn(Optional.empty());
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(scoringEngine.compute(1L)).thenReturn(new EngineResult(
                fresh, List.of(factor(RiskCategory.FLOOD, 40.0)),
                null, 42.0, RiskLevel.MEDIUM, "summary", false));
        when(assessmentRepository.save(any(RiskAssessment.class))).thenAnswer(inv -> {
            inv.<RiskAssessment>getArgument(0).setId(99L);
            return inv.getArgument(0);
        });

        // When
        RiskAssessmentResponse response = service.getOrCompute(1L);

        // Then — saved once with factors, flagged freshly computed
        assertThat(response.getAssessmentId()).isEqualTo(99L);
        assertThat(response.isFreshlyComputed()).isTrue();
        verify(assessmentRepository).save(any(RiskAssessment.class));
        verify(factorRepository).saveAll(anyList());
    }

    @Test
    void should_throw_whenPropertyMissingOnCompute() {
        // Given — the property itself does not exist. authorizeProperty() throws
        // at the property lookup, before the assessment lookup is ever reached, so
        // only the property is stubbed (no stale assessment stub left over).
        when(propertyRepository.findById(1L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> service.getOrCompute(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Property not found: 1");
    }

    @Test
    void should_mapNullScoresToZero_whenEntityHasNulls() {
        // Given — a sparse entity with null category scores and no timestamp
        RiskAssessment sparse = RiskAssessment.builder()
                .overallScore(0.0)
                .overallLevel(RiskLevel.LOW)
                .isLatest(true)
                .build();
        sparse.setId(7L);
        when(assessmentRepository.findByPropertyIdAndIsLatestTrue(1L))
                .thenReturn(Optional.of(sparse));

        // When
        RiskAssessmentResponse response = service.getOrCompute(1L);

        // Then — nulls mapped to 0.0, no NPE
        assertThat(response.getFloodScore()).isZero();
        assertThat(response.getLegalScore()).isZero();
        assertThat(response.getMarketScore()).isZero();
        assertThat(response.getCalculatedAt()).isNull();
    }

    // ── recalculate ─────────────────────────────────────────────────

    @Test
    void should_markPreviousAsNotLatest_whenRecalculating() {
        // Given — an existing latest assessment to supersede
        when(assessmentRepository.existsByPropertyIdAndIsLatestTrue(1L)).thenReturn(true);
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(scoringEngine.compute(1L)).thenReturn(new EngineResult(
                assessment, List.of(), null, 23.0, RiskLevel.LOW, "s", false));
        when(assessmentRepository.save(any(RiskAssessment.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        // When
        service.recalculate(1L);

        // Then — previous version demoted before new one saved
        verify(assessmentRepository).markPreviousAsNotLatest(1L);
        verify(assessmentRepository).save(any(RiskAssessment.class));
    }

    // ── getBreakdown ────────────────────────────────────────────────

    @Test
    void should_returnBreakdownSortedByScoreDescending() {
        // Given — two factors out of order
        when(assessmentRepository.findByPropertyIdAndIsLatestTrue(1L))
                .thenReturn(Optional.of(assessment));
        when(factorRepository.findByRiskAssessmentId(10L)).thenReturn(List.of(
                factor(RiskCategory.LEGAL, 20.0),
                factor(RiskCategory.FLOOD, 40.0)));

        // When
        RiskBreakdownDto breakdown = service.getBreakdown(1L);

        // Then — highest score first
        assertThat(breakdown.getFactors()).hasSize(2);
        assertThat(breakdown.getFactors().get(0).getScore()).isEqualTo(40.0);
        assertThat(breakdown.getFactors().get(0).getCategory()).isEqualTo(RiskCategory.FLOOD);
        assertThat(breakdown.getOverallScore()).isEqualTo(23.0);
    }

    // ── getHistory ──────────────────────────────────────────────────

    @Test
    void should_returnEmptyHistory_whenNoAssessments() {
        // Given — no assessments at all
        when(assessmentRepository.findByPropertyIdOrderByCalculatedAtDesc(1L))
                .thenReturn(List.of());

        // When
        RiskHistoryDto history = service.getHistory(1L);

        // Then
        assertThat(history.getTotalAssessments()).isZero();
        assertThat(history.getHistory()).isEmpty();
    }

    @Test
    void should_computeDeltaAndChronologicalOrder_whenMultipleAssessments() {
        // Given — two assessments, repository returns newest first
        RiskAssessment older = RiskAssessment.builder()
                .overallScore(10.0).overallLevel(RiskLevel.LOW).isLatest(false)
                .calculatedAt(LocalDateTime.of(2026, 1, 1, 9, 0)).build();
        older.setId(1L);
        RiskAssessment newer = RiskAssessment.builder()
                .overallScore(30.0).overallLevel(RiskLevel.MEDIUM).isLatest(true)
                .calculatedAt(LocalDateTime.of(2026, 3, 1, 9, 0)).build();
        newer.setId(2L);
        when(assessmentRepository.findByPropertyIdOrderByCalculatedAtDesc(1L))
                .thenReturn(List.of(newer, older));

        // When
        RiskHistoryDto history = service.getHistory(1L);

        // Then — entries oldest-first, delta = newest − oldest
        assertThat(history.getHistory()).hasSize(2);
        assertThat(history.getHistory().get(0).getOverallScore()).isEqualTo(10.0);
        assertThat(history.getScoreDelta()).isEqualTo(20.0);
        assertThat(history.getCurrentLevel()).isEqualTo(RiskLevel.MEDIUM);
        assertThat(history.getBaselineLevel()).isEqualTo(RiskLevel.LOW);
    }
}
