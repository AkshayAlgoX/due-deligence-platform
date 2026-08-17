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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
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

@Service
@RequiredArgsConstructor
public class RiskAssessmentServiceImpl
        implements RiskAssessmentService {

    private static final Logger log =
            LoggerFactory.getLogger(
                    RiskAssessmentServiceImpl.class
            );

    private final RiskScoringEngine scoringEngine;

    private final RiskAssessmentRepository assessmentRepository;

    private final RiskFactorRepository factorRepository;

    private final PropertyRepository propertyRepository;

    private final UserRepository userRepository;

    // ────────────────────────────────────────────────────────────────
    // Get or compute
    // ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public RiskAssessmentResponse getOrCompute(Long propertyId) {
    log.debug("getOrCompute: propertyId={}", propertyId);
    authorizeProperty(propertyId);

        return assessmentRepository
                .findByPropertyIdAndIsLatestTrue(propertyId)
                .map(existing -> {

                    log.debug(
                            "Returning existing assessment {} for property {}",
                            existing.getId(),
                            propertyId
                    );

                    return toSummaryResponse(
                            existing,
                            false
                    );
                })
                .orElseGet(() -> {

                    log.info(
                            "No existing assessment — computing for property {}",
                            propertyId
                    );

                    return computeAndPersist(propertyId);
                });
    }

    // ────────────────────────────────────────────────────────────────
    // Recalculate
    // ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @Caching(
        evict = {
            @CacheEvict(
                value = "riskAssessmentHistory",
                key = "#propertyId"
            ),
            @CacheEvict(
                value = "riskBreakdown",
                key = "#propertyId"
            )
        }
    )
    public RiskAssessmentResponse recalculate(Long propertyId) {

        log.info("recalculate: force re-scoring property {}", propertyId);
        authorizeProperty(propertyId); 

        if (assessmentRepository
                .existsByPropertyIdAndIsLatestTrue(propertyId)) {

            assessmentRepository
                    .markPreviousAsNotLatest(propertyId);

            log.debug(
                    "Marked previous assessment as not-latest for property {}",
                    propertyId
            );
        }

        return computeAndPersist(propertyId);
    }

    // ────────────────────────────────────────────────────────────────
    // Risk breakdown
    //
    // This is the major missing optimization.
    // The first request executes the DB queries.
    // Subsequent requests for the same property are served
    // directly from Caffeine until the cache expires/gets evicted.
    // ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    @Cacheable(
        value = "riskBreakdown",
        key = "#propertyId"
    )
    public RiskBreakdownDto getBreakdown(Long propertyId) {
    log.debug(
       "getBreakdown: propertyId={}",
       propertyId
    );
    authorizeProperty(propertyId);

        return assessmentRepository
                .findByPropertyIdAndIsLatestTrue(propertyId)
                .map(this::buildBreakdownFromEntity)
                .orElseGet(() -> {

                    log.info(
                            "No assessment for breakdown — computing for property {}",
                            propertyId
                    );

                    computeAndPersist(propertyId);

                    return assessmentRepository
                            .findByPropertyIdAndIsLatestTrue(propertyId)
                            .map(this::buildBreakdownFromEntity)
                            .orElseThrow(
                                    () ->
                                            new RuntimeException(
                                                    "Assessment not found after compute for property: "
                                                            + propertyId
                                            )
                            );
                });
    }

    // ────────────────────────────────────────────────────────────────
    // Risk history
    // ────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
        value = "riskAssessmentHistory",
        key = "#propertyId"
    )
    public RiskHistoryDto getHistory(Long propertyId) {
        log.debug(
                "getHistory: propertyId={}",
                propertyId
        );
        authorizeProperty(propertyId);

        List<RiskAssessment> all =
                assessmentRepository
                        .findByPropertyIdOrderByCalculatedAtDesc(
                                propertyId
                        );

        if (all.isEmpty()) {

            return RiskHistoryDto.builder()
                    .propertyId(propertyId)
                    .history(List.of())
                    .totalAssessments(0)
                    .build();
        }

        // Oldest -> newest for trend visualization.
        List<RiskAssessment> chronological =
                all.stream()
                        .sorted(
                                Comparator.comparing(
                                        RiskAssessment::getCalculatedAt
                                )
                        )
                        .collect(Collectors.toList());

        List<RiskHistoryDto.HistoryEntry> entries =
                chronological.stream()
                        .map(
                                assessment ->
                                        RiskHistoryDto.HistoryEntry
                                                .builder()
                                                .assessmentId(
                                                        assessment.getId()
                                                )
                                                .overallScore(
                                                        assessment
                                                                .getOverallScore()
                                                )
                                                .overallLevel(
                                                        assessment
                                                                .getOverallLevel()
                                                )
                                                .floodScore(
                                                        nvl(
                                                                assessment
                                                                        .getFloodScore()
                                                        )
                                                )
                                                .legalScore(
                                                        nvl(
                                                                assessment
                                                                        .getLegalScore()
                                                        )
                                                )
                                                .taxScore(
                                                        nvl(
                                                                assessment
                                                                        .getTaxScore()
                                                        )
                                                )
                                                .zoningScore(
                                                        nvl(
                                                                assessment
                                                                        .getZoningScore()
                                                        )
                                                )
                                                .environmentalScore(
                                                        nvl(
                                                                assessment
                                                                        .getEnvironmentalScore()
                                                        )
                                                )
                                                .marketScore(
                                                        nvl(
                                                                assessment
                                                                        .getMarketScore()
                                                        )
                                                )
                                                .summary(
                                                        assessment
                                                                .getSummary()
                                                )
                                                .dataIncomplete(false)
                                                .calculatedAt(
                                                        toInstant(
                                                                assessment
                                                                        .getCalculatedAt()
                                                        )
                                                )
                                                .isLatest(
                                                        Boolean.TRUE.equals(
                                                                assessment
                                                                        .getIsLatest()
                                                        )
                                                )
                                                .build()
                        )
                        .collect(Collectors.toList());

        RiskAssessment latest = all.get(0);

        RiskAssessment oldest =
                chronological.get(0);

        Double scoreDelta =
                all.size() > 1
                        ? latest.getOverallScore()
                                - oldest.getOverallScore()
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

    // ────────────────────────────────────────────────────────────────
    // Internal computation
    // ────────────────────────────────────────────────────────────────
/**
 * RBAC: owner or view-all roles (ADMIN / LEGAL_REVIEWER / FINANCIAL_INSTITUTION).
 */
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


    private RiskAssessmentResponse computeAndPersist(
            Long propertyId) {

         Property property = propertyRepository
        .findById(propertyId)
        .orElseThrow(
            () -> new RuntimeException(
                "Property not found: " + propertyId
            )
        ); 
        
        RiskScoringEngine.EngineResult result =
                scoringEngine.compute(propertyId);

        RiskAssessment assessment =
                result.assessment();

        assessment.setProperty(property);

        assessment.setCalculatedAt(
                LocalDateTime.now()
        );

        RiskAssessment saved =
                assessmentRepository.save(assessment);

        log.info(
                "Persisted risk assessment id={} for property {}",
                saved.getId(),
                propertyId
        );

        List<RiskFactor> factors =
                result.factorEntities();

        factors.forEach(
                factor ->
                        factor.setRiskAssessment(saved)
        );

        factorRepository.saveAll(factors);

        log.debug(
                "Persisted {} risk factors for assessment {}",
                factors.size(),
                saved.getId()
        );

        return toSummaryResponse(
                saved,
                true
        );
    }

    // ────────────────────────────────────────────────────────────────
    // DTO mappers
    // ────────────────────────────────────────────────────────────────

    private RiskAssessmentResponse toSummaryResponse(
            RiskAssessment assessment,
            boolean freshlyComputed) {

        return RiskAssessmentResponse.builder()
                .assessmentId(assessment.getId())
                .propertyId(
                        assessment.getProperty() != null
                                ? assessment.getProperty().getId()
                                : null
                )
                .overallScore(
                        assessment.getOverallScore()
                )
                .overallLevel(
                        assessment.getOverallLevel()
                )
                .floodScore(
                        nvl(assessment.getFloodScore())
                )
                .legalScore(
                        nvl(assessment.getLegalScore())
                )
                .taxScore(
                        nvl(assessment.getTaxScore())
                )
                .zoningScore(
                        nvl(assessment.getZoningScore())
                )
                .environmentalScore(
                        nvl(
                                assessment
                                        .getEnvironmentalScore()
                        )
                )
                .marketScore(
                        nvl(assessment.getMarketScore())
                )
                .summary(
                        assessment.getSummary()
                )
                .freshlyComputed(
                        freshlyComputed
                )
                .dataIncomplete(false)
                .calculatedAt(
                        toInstant(
                                assessment.getCalculatedAt()
                        )
                )
                .version(0)
                .build();
    }

    private RiskBreakdownDto buildBreakdownFromEntity(
            RiskAssessment assessment) {

        /*
         * This is one indexed query:
         *
         * SELECT ...
         * FROM risk_factors
         * WHERE assessment_id = ?
         *
         * V20 adds idx_risk_factor_assessment for this lookup.
         */
        List<RiskFactor> factors =
                factorRepository
                        .findByRiskAssessmentId(
                                assessment.getId()
                        );

        List<RiskFactorDto> factorDtos =
                factors.stream()
                        .map(
                                factor ->
                                        RiskFactorDto.builder()
                                                .category(
                                                        factor.getCategory()
                                                )
                                                .score(
                                                        factor.getScore()
                                                )
                                                .level(
                                                        factor.getLevel()
                                                )
                                                .weight(
                                                        factor.getWeight() != null
                                                                ? factor.getWeight()
                                                                : 0.0
                                                )
                                                .explanation(
                                                        factor.getExplanation()
                                                )
                                                .recommendation(
                                                        factor.getRecommendation()
                                                )
                                                .dataSource(
                                                        factor.getDataSource()
                                                )
                                                .dataUncertain(false)
                                                .build()
                        )
                        .sorted(
                                Comparator.comparingDouble(
                                        RiskFactorDto::getScore
                                ).reversed()
                        )
                        .collect(Collectors.toList());

        boolean dataIncomplete =
                factorDtos.stream()
                        .anyMatch(
                                RiskFactorDto::isDataUncertain
                        );

        return RiskBreakdownDto.builder()
                .propertyId(
                        assessment.getProperty() != null
                                ? assessment.getProperty().getId()
                                : null
                )
                .assessmentId(
                        assessment.getId()
                )
                .overallScore(
                        assessment.getOverallScore()
                )
                .overallLevel(
                        assessment.getOverallLevel()
                )
                .floodScore(
                        nvl(assessment.getFloodScore())
                )
                .legalScore(
                        nvl(assessment.getLegalScore())
                )
                .taxScore(
                        nvl(assessment.getTaxScore())
                )
                .zoningScore(
                        nvl(assessment.getZoningScore())
                )
                .environmentalScore(
                        nvl(
                                assessment
                                        .getEnvironmentalScore()
                        )
                )
                .marketScore(
                        nvl(assessment.getMarketScore())
                )
                .factors(factorDtos)
                .dataIncomplete(dataIncomplete)
                .unavailableProviderCount(0)
                .calculatedAt(
                        toInstant(
                                assessment.getCalculatedAt()
                        )
                )
                .build();
    }

    // ────────────────────────────────────────────────────────────────
    // Conversion helpers
    // ────────────────────────────────────────────────────────────────

    private Instant toInstant(LocalDateTime value) {

        if (value == null) {
            return null;
        }

        return value.toInstant(
                ZoneOffset.UTC
        );
    }

    private double nvl(Double value) {

        return value != null
                ? value
                : 0.0;
    }
}