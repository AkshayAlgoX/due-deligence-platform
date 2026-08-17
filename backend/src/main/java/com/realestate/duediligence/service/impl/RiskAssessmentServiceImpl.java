// backend/src/main/java/com/realestate/duediligence/service/impl/RiskAssessmentServiceImpl.java
package com.realestate.duediligence.service.impl;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.dto.RiskAssessmentResponse;
import com.realestate.duediligence.dto.RiskBreakdownDto;
import com.realestate.duediligence.dto.RiskFactorDto;
import com.realestate.duediligence.dto.RiskHistoryDto;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.RiskAssessment;
import com.realestate.duediligence.entity.RiskFactor;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.RiskAssessmentRepository;
import com.realestate.duediligence.repository.RiskFactorRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.RiskAssessmentService;
import com.realestate.duediligence.service.RiskScoringEngine;
import com.realestate.duediligence.util.RoleUtils;

import lombok.RequiredArgsConstructor;

/**
 * Implementation of RiskAssessmentService.
 *
 * Uses LocalDateTime throughout to match RiskAssessment entity field types.
 * Converts to Instant only for DTO responses (DTOs use Instant for JSON serialization).
 */
@Service
@RequiredArgsConstructor
public class RiskAssessmentServiceImpl implements RiskAssessmentService {

    private static final Logger log = LoggerFactory.getLogger(RiskAssessmentServiceImpl.class);

    private final RiskScoringEngine scoringEngine;
    private final RiskAssessmentRepository assessmentRepository;
    private final RiskFactorRepository factorRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    // ── getOrCompute ──────────────────────────────────────────────

    @Override
    @Transactional
    public RiskAssessmentResponse getOrCompute(Long propertyId) {
        log.debug("getOrCompute: propertyId={}", propertyId);
        authorizeProperty(propertyId);

        return assessmentRepository
                .findByPropertyIdAndIsLatestTrue(propertyId)
                .map(existing -> {
                    log.debug("Returning existing assessment {} for property {}",
                            existing.getId(), propertyId);
                    return toSummaryResponse(existing, false);
                })
                .orElseGet(() -> {
                    log.info("No existing assessment — computing for property {}", propertyId);
                    return computeAndPersist(propertyId);
                });
    }

    // ── recalculate ───────────────────────────────────────────────

    @Override
    @Transactional
    public RiskAssessmentResponse recalculate(Long propertyId) {
        log.info("recalculate: force re-scoring property {}", propertyId);
        authorizeProperty(propertyId);

        if (assessmentRepository.existsByPropertyIdAndIsLatestTrue(propertyId)) {
            assessmentRepository.markPreviousAsNotLatest(propertyId);
            log.debug("Marked previous assessment as not-latest for property {}", propertyId);
        }

        return computeAndPersist(propertyId);
    }

    // ── getBreakdown ──────────────────────────────────────────────

    @Override
    @Transactional
    public RiskBreakdownDto getBreakdown(Long propertyId) {
        log.debug("getBreakdown: propertyId={}", propertyId);
        authorizeProperty(propertyId);

        return assessmentRepository
                .findByPropertyIdAndIsLatestTrue(propertyId)
                .map(this::buildBreakdownFromEntity)
                .orElseGet(() -> {
                    log.info("No assessment for breakdown — computing for property {}", propertyId);
                    computeAndPersist(propertyId);
                    return assessmentRepository
                            .findByPropertyIdAndIsLatestTrue(propertyId)
                            .map(this::buildBreakdownFromEntity)
                            .orElseThrow(() -> new RuntimeException(
                                    "Assessment not found after compute for property: " + propertyId));
                });
    }

    // ── getHistory ────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public RiskHistoryDto getHistory(Long propertyId) {
        log.debug("getHistory: propertyId={}", propertyId);
        authorizeProperty(propertyId);

        List<RiskAssessment> all = assessmentRepository
                .findByPropertyIdOrderByCalculatedAtDesc(propertyId);

        if (all.isEmpty()) {
            return RiskHistoryDto.builder()
                    .propertyId(propertyId)
                    .history(List.of())
                    .totalAssessments(0)
                    .build();
        }

        // Chronological order (oldest first) for trend chart
        List<RiskAssessment> chronological = all.stream()
                .sorted(Comparator.comparing(RiskAssessment::getCalculatedAt))
                .collect(Collectors.toList());

        List<RiskHistoryDto.HistoryEntry> entries = chronological.stream()
                .map(a -> RiskHistoryDto.HistoryEntry.builder()
                        .assessmentId(a.getId())
                        .overallScore(a.getOverallScore())
                        .overallLevel(a.getOverallLevel())
                        .floodScore(nvl(a.getFloodScore()))
                        .legalScore(nvl(a.getLegalScore()))
                        .taxScore(nvl(a.getTaxScore()))
                        .zoningScore(nvl(a.getZoningScore()))
                        .environmentalScore(nvl(a.getEnvironmentalScore()))
                        .marketScore(nvl(a.getMarketScore()))
                        .summary(a.getSummary())
                        .dataIncomplete(false)
                        .calculatedAt(toInstant(a.getCalculatedAt()))
                        .isLatest(Boolean.TRUE.equals(a.getIsLatest()))
                        .build())
                .collect(Collectors.toList());

        // newest = first in DESC-sorted list
        RiskAssessment latest   = all.get(0);
        RiskAssessment oldest   = chronological.get(0);

        Double scoreDelta = all.size() > 1
                ? latest.getOverallScore() - oldest.getOverallScore()
                : null;

        return RiskHistoryDto.builder()
                .propertyId(propertyId)
                .history(entries)
                .totalAssessments(all.size())
                .latestAssessmentId(latest.getId())
                .scoreDelta(scoreDelta)
                .currentLevel(latest.getOverallLevel())
                .baselineLevel(oldest.getOverallLevel())
                .build();
    }

    // ══════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ══════════════════════════════════════════════════════════════

    /** RBAC: owner or view-all roles (ADMIN / LEGAL_REVIEWER / FINANCIAL_INSTITUTION). */
    private void authorizeProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found: " + propertyId));
        User currentUser = resolveCurrentUser();
        if (!RoleUtils.canAccessProperty(currentUser, property)) {
            throw new RuntimeException("Property not found: " + propertyId);
        }
    }

    private User resolveCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return null;
            String email = auth.getName();
            if (email == null || email.isBlank()) return null;
            return userRepository.findByEmail(email).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private RiskAssessmentResponse computeAndPersist(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found: " + propertyId));

        RiskScoringEngine.EngineResult result = scoringEngine.compute(propertyId);

        RiskAssessment assessment = result.assessment();
        assessment.setProperty(property);
        assessment.setCalculatedAt(LocalDateTime.now());

        // Persist assessment first — factors need the FK
        RiskAssessment saved = assessmentRepository.save(assessment);
        log.info("Persisted risk assessment id={} for property {}",
                saved.getId(), propertyId);

        // Wire and persist factors
        List<RiskFactor> factors = result.factorEntities();
        factors.forEach(f -> f.setRiskAssessment(saved));
        factorRepository.saveAll(factors);
        log.debug("Persisted {} risk factors for assessment {}", factors.size(), saved.getId());

        return toSummaryResponse(saved, true);
    }

    // ── DTO mappers ───────────────────────────────────────────────

    private RiskAssessmentResponse toSummaryResponse(RiskAssessment a, boolean freshlyComputed) {
        return RiskAssessmentResponse.builder()
                .assessmentId(a.getId())
                .propertyId(a.getProperty() != null ? a.getProperty().getId() : null)
                .overallScore(a.getOverallScore())
                .overallLevel(a.getOverallLevel())
                .floodScore(nvl(a.getFloodScore()))
                .legalScore(nvl(a.getLegalScore()))
                .taxScore(nvl(a.getTaxScore()))
                .zoningScore(nvl(a.getZoningScore()))
                .environmentalScore(nvl(a.getEnvironmentalScore()))
                .marketScore(nvl(a.getMarketScore()))
                .summary(a.getSummary())
                .freshlyComputed(freshlyComputed)
                .dataIncomplete(false)
                .calculatedAt(toInstant(a.getCalculatedAt()))
                .version(0)
                .build();
    }

    private RiskBreakdownDto buildBreakdownFromEntity(RiskAssessment a) {
        List<RiskFactor> factors = factorRepository.findByRiskAssessmentId(a.getId());

        List<RiskFactorDto> factorDtos = factors.stream()
                .map(f -> RiskFactorDto.builder()
                        .category(f.getCategory())
                        .score(f.getScore())
                        .level(f.getLevel())
                        .weight(f.getWeight() != null ? f.getWeight() : 0.0)
                        .explanation(f.getExplanation())
                        .recommendation(f.getRecommendation())
                        .dataSource(f.getDataSource())
                        .dataUncertain(false)
                        .build())
                .sorted(Comparator.comparingDouble(RiskFactorDto::getScore).reversed())
                .collect(Collectors.toList());

        boolean dataIncomplete = factorDtos.stream()
                .anyMatch(RiskFactorDto::isDataUncertain);

        return RiskBreakdownDto.builder()
                .propertyId(a.getProperty() != null ? a.getProperty().getId() : null)
                .assessmentId(a.getId())
                .overallScore(a.getOverallScore())
                .overallLevel(a.getOverallLevel())
                .floodScore(nvl(a.getFloodScore()))
                .legalScore(nvl(a.getLegalScore()))
                .taxScore(nvl(a.getTaxScore()))
                .zoningScore(nvl(a.getZoningScore()))
                .environmentalScore(nvl(a.getEnvironmentalScore()))
                .marketScore(nvl(a.getMarketScore()))
                .factors(factorDtos)
                .dataIncomplete(dataIncomplete)
                .unavailableProviderCount(0)
                .calculatedAt(toInstant(a.getCalculatedAt()))
                .build();
    }

    // ── Type conversion helpers ───────────────────────────────────

    /**
     * Converts LocalDateTime (entity) → Instant (DTO).
     * Assumes UTC. If your app uses a different timezone,
     * replace ZoneOffset.UTC with ZoneId.systemDefault().getRules().getOffset(ldt)
     */
    private Instant toInstant(LocalDateTime ldt) {
        if (ldt == null) return null;
        return ldt.toInstant(ZoneOffset.UTC);
    }

    /** Null-safe double — returns 0.0 for null entity fields. */
    private double nvl(Double value) {
        return value != null ? value : 0.0;
    }
}