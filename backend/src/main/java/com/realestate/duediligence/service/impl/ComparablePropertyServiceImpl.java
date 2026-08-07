package com.realestate.duediligence.service.impl;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.ComparableAnalysisResponse;
import com.realestate.duediligence.dto.ComparablePropertyDto;
import com.realestate.duediligence.dto.ComparableSearchRequest;
import com.realestate.duediligence.dto.PriceTrendDto;
import com.realestate.duediligence.entity.ComparableAnalysis;
import com.realestate.duediligence.entity.ComparableProperty;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.enums.SimilarityLevel;
import com.realestate.duediligence.repository.ComparableAnalysisRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.service.ComparablePropertyService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

/**
 * ComparablePropertyServiceImpl
 *
 * KNOWN LIMITATION (flagging deliberately, not hiding it):
 * `findNearbyProperties` pulls all geo-tagged properties via
 * PropertyRepository.findAllWithCoordinates() (an existing query in your
 * repo — good, this avoids loading properties with no lat/lng at all), then
 * does Haversine distance filtering in-memory. Fine for the current dataset
 * size, but will not scale to a very large properties table — a bounding-box
 * SQL query (or PostGIS) would be the production fix if that day comes.
 */
@Service
@RequiredArgsConstructor
public class ComparablePropertyServiceImpl implements ComparablePropertyService {

    private static final double DEFAULT_RADIUS_KM = 5.0;
    private static final int DEFAULT_LIMIT = 10;
    private static final double EARTH_RADIUS_KM = 6371.0;

    private final ComparableAnalysisRepository comparableAnalysisRepository;
    private final PropertyRepository propertyRepository;

    @Override
    public ComparableAnalysisResponse getComparables(Long propertyId, Double radiusKm, Integer limit) {
        Property property = getPropertyOrThrow(propertyId);
        double radius = radiusKm != null ? radiusKm : DEFAULT_RADIUS_KM;
        int max = limit != null ? limit : DEFAULT_LIMIT;

        ComparableAnalysis analysis = buildAnalysis(property, radius, max);
        comparableAnalysisRepository.save(analysis);

        return toResponse(analysis);
    }

    @Override
    public List<ComparablePropertyDto> getMapData(Long propertyId, Double radiusKm) {
        Property property = getPropertyOrThrow(propertyId);
        double radius = radiusKm != null ? radiusKm : DEFAULT_RADIUS_KM;

        return findNearbyProperties(property, radius, Integer.MAX_VALUE).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ComparablePropertyDto getSimilarity(Long propertyId, Long compId) {
        Property property = getPropertyOrThrow(propertyId);
        Property comp = propertyRepository.findById(compId)
                .orElseThrow(() -> new EntityNotFoundException("Comparable property not found: " + compId));

        ComparableProperty cp = buildComparableProperty(property, comp);
        return toDto(cp);
    }

    @Override
    public ComparableAnalysisResponse searchComparables(Long propertyId, ComparableSearchRequest request) {
        Property property = getPropertyOrThrow(propertyId);

        double radius = request.getRadiusKm() != null ? request.getRadiusKm() : DEFAULT_RADIUS_KM;
        int max = request.getLimit() != null ? request.getLimit() : DEFAULT_LIMIT;

        List<Property> candidates = propertyRepository.findAllWithCoordinates().stream()
                .filter(p -> !p.getId().equals(property.getId()))
                .filter(p -> withinDistance(property, p, radius))
                .filter(p -> request.getMinPrice() == null
                        || (p.getMarketValue() != null && p.getMarketValue() >= request.getMinPrice()))
                .filter(p -> request.getMaxPrice() == null
                        || (p.getMarketValue() != null && p.getMarketValue() <= request.getMaxPrice()))
                .filter(p -> request.getMinBedrooms() == null
                        || (p.getBedrooms() != null && p.getBedrooms() >= request.getMinBedrooms()))
                .filter(p -> request.getMaxBedrooms() == null
                        || (p.getBedrooms() != null && p.getBedrooms() <= request.getMaxBedrooms()))
                .filter(p -> request.getPropertyType() == null
                        || request.getPropertyType().equalsIgnoreCase(p.getPropertyType()))
                .collect(Collectors.toList());

        ComparableAnalysis analysis = new ComparableAnalysis();
        analysis.setProperty(property);
        analysis.setRadiusKm(radius);

        List<ComparableProperty> comps = candidates.stream()
                .map(p -> buildComparableProperty(property, p))
                .sorted(Comparator.comparingDouble(ComparableProperty::getSimilarityScore).reversed())
                .limit(max)
                .collect(Collectors.toList());

        comps.forEach(cp -> cp.setAnalysis(analysis));
        analysis.setComparableProperties(comps);

        comparableAnalysisRepository.save(analysis);

        return toResponse(analysis);
    }

    @Override
    public List<PriceTrendDto> getPriceTrends(Long propertyId) {
        Property property = getPropertyOrThrow(propertyId);

        List<ComparableProperty> nearby = findNearbyProperties(property, DEFAULT_RADIUS_KM, Integer.MAX_VALUE);

        // Bucketed by the comparable property's createdAt month, since we
        // don't have historical price snapshots — this approximates a trend
        // using when comparable listings entered the system.
        return nearby.stream()
                .filter(cp -> cp.getCompProperty().getCreatedAt() != null)
                .collect(Collectors.groupingBy(cp ->
                        cp.getCompProperty().getCreatedAt().toLocalDate()
                                .withDayOfMonth(1).toString().substring(0, 7)))
                .entrySet().stream()
                .map(entry -> {
                    List<ComparableProperty> monthComps = entry.getValue();

                    double avgPricePerSqft = monthComps.stream()
                            .filter(cp -> cp.getCompProperty().getMarketValue() != null
                                    && cp.getCompProperty().getArea() != null
                                    && cp.getCompProperty().getArea() > 0)
                            .mapToDouble(cp -> cp.getCompProperty().getMarketValue() / cp.getCompProperty().getArea())
                            .average()
                            .orElse(0.0);

                    List<Double> prices = monthComps.stream()
                            .map(cp -> cp.getCompProperty().getMarketValue())
                            .filter(v -> v != null)
                            .sorted()
                            .collect(Collectors.toList());
                    double median = prices.isEmpty() ? 0.0 : prices.get(prices.size() / 2);

                    return PriceTrendDto.builder()
                            .month(entry.getKey())
                            .avgPricePerSqft(round2(avgPricePerSqft))
                            .medianPrice(round2(median))
                            .sampleSize(monthComps.size())
                            .build();
                })
                .sorted(Comparator.comparing(PriceTrendDto::getMonth))
                .collect(Collectors.toList());
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private Property getPropertyOrThrow(Long propertyId) {
        return propertyRepository.findById(propertyId)
                .orElseThrow(() -> new EntityNotFoundException("Property not found: " + propertyId));
    }

    private ComparableAnalysis buildAnalysis(Property property, double radiusKm, int limit) {
        List<ComparableProperty> comps = findNearbyProperties(property, radiusKm, limit);

        ComparableAnalysis analysis = new ComparableAnalysis();
        analysis.setProperty(property);
        analysis.setRadiusKm(radiusKm);
        comps.forEach(cp -> cp.setAnalysis(analysis));
        analysis.setComparableProperties(comps);
        return analysis;
    }

    private List<ComparableProperty> findNearbyProperties(Property property, double radiusKm, int limit) {
        return propertyRepository.findAllWithCoordinates().stream()
                .filter(p -> !p.getId().equals(property.getId()))
                .filter(p -> withinDistance(property, p, radiusKm))
                .map(p -> buildComparableProperty(property, p))
                .sorted(Comparator.comparingDouble(ComparableProperty::getSimilarityScore).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private boolean withinDistance(Property from, Property to, double radiusKm) {
        if (from.getLatitude() == null || from.getLongitude() == null
                || to.getLatitude() == null || to.getLongitude() == null) {
            return false;
        }
        return haversineKm(from.getLatitude(), from.getLongitude(),
                to.getLatitude(), to.getLongitude()) <= radiusKm;
    }

    private ComparableProperty buildComparableProperty(Property subject, Property candidate) {
        double distanceKm = haversineKm(
                subject.getLatitude(), subject.getLongitude(),
                candidate.getLatitude(), candidate.getLongitude());

        double similarityScore = computeSimilarityScore(subject, candidate);

        ComparableProperty cp = new ComparableProperty();
        cp.setCompProperty(candidate);
        cp.setDistanceKm(round2(distanceKm));
        cp.setSimilarityScore(round2(similarityScore));
        cp.setSimilarityLevel(toSimilarityLevel(similarityScore));
        return cp;
    }

    /**
     * Similarity score 0-100, weighted:
     *  - property type exact match: 30 pts
     *  - area closeness (within 30% tolerance): up to 25 pts
     *  - bedroom count closeness (within 50% tolerance): up to 20 pts
     *  - market value closeness (within 25% tolerance): up to 25 pts
     *
     * These weights/tolerances are a reasonable starting heuristic, not a
     * spec from the team — worth a quick sanity check with whoever owns
     * the risk-scoring conventions before this ships.
     */
    private double computeSimilarityScore(Property subject, Property candidate) {
        double score = 0.0;

        if (subject.getPropertyType() != null
                && subject.getPropertyType().equalsIgnoreCase(candidate.getPropertyType())) {
            score += 30.0;
        }

        score += closenessScore(subject.getArea(), candidate.getArea(), 25.0, 0.30);
        score += closenessScore(
                subject.getBedrooms() != null ? subject.getBedrooms().doubleValue() : null,
                candidate.getBedrooms() != null ? candidate.getBedrooms().doubleValue() : null,
                20.0, 0.5);
        score += closenessScore(subject.getMarketValue(), candidate.getMarketValue(), 25.0, 0.25);

        return Math.min(score, 100.0);
    }

    /** Awards up to maxPoints based on % difference between two values, scaled by tolerance. */
    private double closenessScore(Double a, Double b, double maxPoints, double tolerancePct) {
        if (a == null || b == null || a == 0) return 0.0;
        double pctDiff = Math.abs(a - b) / a;
        if (pctDiff >= tolerancePct) return 0.0;
        return maxPoints * (1 - (pctDiff / tolerancePct));
    }

    private SimilarityLevel toSimilarityLevel(double score) {
        if (score >= 80) return SimilarityLevel.VERY_SIMILAR;
        if (score >= 55) return SimilarityLevel.SIMILAR;
        return SimilarityLevel.SOMEWHAT_SIMILAR;
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private ComparablePropertyDto toDto(ComparableProperty cp) {
        Property p = cp.getCompProperty();
        Double pricePerSqft = (p.getMarketValue() != null && p.getArea() != null && p.getArea() > 0)
                ? round2(p.getMarketValue() / p.getArea())
                : null;

        return ComparablePropertyDto.builder()
                .id(cp.getId())
                .propertyId(p.getId())
                .address(p.getAddress())
                .city(p.getCity())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .marketValue(p.getMarketValue())
                .area(p.getArea())
                .bedrooms(p.getBedrooms())
                .bathrooms(p.getBathrooms())
                .similarityScore(cp.getSimilarityScore())
                .similarityLevel(cp.getSimilarityLevel() != null ? cp.getSimilarityLevel().name() : null)
                .distanceKm(cp.getDistanceKm())
                .pricePerSqft(pricePerSqft)
                .build();
    }

    private ComparableAnalysisResponse toResponse(ComparableAnalysis analysis) {
        List<ComparablePropertyDto> dtos = analysis.getComparableProperties().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return ComparableAnalysisResponse.builder()
                .id(analysis.getId())
                .propertyId(analysis.getProperty().getId())
                .radiusKm(analysis.getRadiusKm())
                .createdAt(analysis.getCreatedAt())
                .comparables(dtos)
                .build();
    }
}
