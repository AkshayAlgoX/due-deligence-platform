package com.realestate.duediligence.service.impl;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.dto.PropertyLabelDto;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.PropertyLabel;
import com.realestate.duediligence.enums.LabelSource;
import com.realestate.duediligence.enums.LabelType;
import com.realestate.duediligence.repository.PropertyLabelRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.service.PropertyLabelService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PropertyLabelServiceImpl implements PropertyLabelService {

    private final PropertyLabelRepository labelRepository;
    private final PropertyRepository propertyRepository;

    // ==================== READ ====================

    @Override
    @Transactional(readOnly = true)
    public List<PropertyLabelDto> getLabelsForProperty(Long propertyId) {
        return labelRepository.findByPropertyId(propertyId).stream()
            .filter(this::isNotExpired)
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, List<PropertyLabelDto>> getLabelsForProperties(List<Long> propertyIds) {
        if (propertyIds == null || propertyIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return labelRepository.findByPropertyIdIn(propertyIds).stream()
            .filter(this::isNotExpired)
            .collect(Collectors.groupingBy(
                l -> l.getProperty().getId(),
                Collectors.mapping(this::toDto, Collectors.toList())
            ));
    }

    // ==================== MANUAL LABELS ====================

    @Override
    public PropertyLabelDto addManualLabel(Long propertyId, LabelType type, Integer expiresInDays, Long userId) {
        Property property = propertyRepository.findById(propertyId)
            .orElseThrow(() -> new RuntimeException("Property not found: " + propertyId));

        // Remove existing label of same type
        labelRepository.deleteByPropertyIdAndType(propertyId, type);

        LocalDateTime expiresAt = expiresInDays != null
            ? LocalDateTime.now().plusDays(expiresInDays)
            : null;

        PropertyLabel label = PropertyLabel.builder()
            .property(property)
            .type(type)
            .source(LabelSource.MANUAL)
            .createdAt(LocalDateTime.now())
            .expiresAt(expiresAt)
            .createdBy(userId)
            .build();

        PropertyLabel saved = labelRepository.save(label);
        log.info("Manual label {} added to property {} by user {}", type, propertyId, userId);
        return toDto(saved);
    }

    @Override
    public void removeLabel(Long propertyId, Long labelId) {
        PropertyLabel label = labelRepository.findById(labelId)
            .orElseThrow(() -> new RuntimeException("Label not found: " + labelId));

        if (!label.getProperty().getId().equals(propertyId)) {
            throw new RuntimeException("Label does not belong to property");
        }

        labelRepository.delete(label);
        log.info("Label {} removed from property {}", label.getType(), propertyId);
    }

    // ==================== AUTO LABELS ====================

    @Override
    public void recalculateAutoLabels(Long propertyId) {
        Property property = propertyRepository.findById(propertyId).orElse(null);
        if (property == null) return;

        // Rule 1: NEW — Listed < 7 days
        applyOrRemoveAutoLabel(
            property,
            LabelType.NEW,
            isNewListing(property),
            7
        );

        // Rule 2: HOT — 50+ views in 3 days (uses viewCount if exists, else skip)
        applyOrRemoveAutoLabel(
            property,
            LabelType.HOT,
            isHotProperty(property),
            3
        );

        // Rule 3: PRICE_DROP — Price reduced in last 14 days
        applyOrRemoveAutoLabel(
            property,
            LabelType.PRICE_DROP,
            hasPriceDrop(property),
            14
        );

        // Rule 4: VERIFIED — DISABLED (shown elsewhere in UI, not a marketing label)

        // Rule 5: SOLD — Property status
        applyOrRemoveAutoLabel(
            property,
            LabelType.SOLD,
            isSold(property),
            null
        );
    }

    @Override
    public int recalculateAllAutoLabels() {
        List<Property> allProperties = propertyRepository.findAll();
        int count = 0;
        for (Property p : allProperties) {
            try {
                recalculateAutoLabels(p.getId());
                count++;
            } catch (Exception e) {
                log.error("Failed to recalculate labels for property {}: {}", p.getId(), e.getMessage());
            }
        }
        log.info("Recalculated auto labels for {} properties", count);
        return count;
    }

    @Override
    public int cleanupExpiredLabels() {
        int deleted = labelRepository.deleteExpiredLabels(LocalDateTime.now());
        if (deleted > 0) {
            log.info("Cleaned up {} expired labels", deleted);
        }
        return deleted;
    }

    // ==================== RULES ====================

    private boolean isNewListing(Property property) {
        if (property.getCreatedAt() == null) return false;
        return property.getCreatedAt().isAfter(LocalDateTime.now().minusDays(7));
    }

    private boolean isHotProperty(Property property) {
        // If your Property entity has viewCount field, use it
        // For now, return false (safe default)
        try {
            var viewCountField = property.getClass().getDeclaredField("viewCount");
            viewCountField.setAccessible(true);
            Object val = viewCountField.get(property);
            if (val instanceof Number) {
                return ((Number) val).intValue() >= 50;
            }
        } catch (Exception ignored) {}
        return false;
    }

    private boolean hasPriceDrop(Property property) {
        // If your Property entity has priceHistory or previousPrice, use it
        // For now, return false (safe default)
        return false;
    }

    private boolean isSold(Property property) {
        try {
            var field = property.getClass().getDeclaredField("status");
            field.setAccessible(true);
            Object val = field.get(property);
            return val != null && val.toString().equalsIgnoreCase("SOLD");
        } catch (Exception ignored) {}
        return false;
    }

    // ==================== HELPERS ====================

    private void applyOrRemoveAutoLabel(Property property, LabelType type, boolean shouldApply, Integer expiresInDays) {
        Optional<PropertyLabel> existing = labelRepository.findByPropertyIdAndType(property.getId(), type);

        if (shouldApply) {
            if (existing.isEmpty() || existing.get().getSource() == LabelSource.MANUAL) {
                // Don't overwrite manual labels
                if (existing.isPresent() && existing.get().getSource() == LabelSource.MANUAL) return;

                LocalDateTime expiresAt = expiresInDays != null
                    ? LocalDateTime.now().plusDays(expiresInDays)
                    : null;

                PropertyLabel label = PropertyLabel.builder()
                    .property(property)
                    .type(type)
                    .source(LabelSource.AUTO)
                    .createdAt(LocalDateTime.now())
                    .expiresAt(expiresAt)
                    .build();

                labelRepository.save(label);
            }
        } else {
            // Remove auto label if condition no longer true
            existing.ifPresent(label -> {
                if (label.getSource() == LabelSource.AUTO) {
                    labelRepository.delete(label);
                }
            });
        }
    }

    private boolean isNotExpired(PropertyLabel label) {
        return label.getExpiresAt() == null || label.getExpiresAt().isAfter(LocalDateTime.now());
    }

    private PropertyLabelDto toDto(PropertyLabel label) {
        return PropertyLabelDto.builder()
            .id(label.getId())
            .propertyId(label.getProperty().getId())
            .type(label.getType())
            .source(label.getSource())
            .createdAt(label.getCreatedAt())
            .expiresAt(label.getExpiresAt())
            .build();
    }
}