package com.realestate.duediligence.service;

import java.util.List;
import java.util.Map;

import com.realestate.duediligence.dto.PropertyLabelDto;
import com.realestate.duediligence.enums.LabelType;

public interface PropertyLabelService {

    List<PropertyLabelDto> getLabelsForProperty(Long propertyId);

    Map<Long, List<PropertyLabelDto>> getLabelsForProperties(List<Long> propertyIds);

    PropertyLabelDto addManualLabel(Long propertyId, LabelType type, Integer expiresInDays, Long userId);

    void removeLabel(Long propertyId, Long labelId);

    void recalculateAutoLabels(Long propertyId);

    int recalculateAllAutoLabels();

    int cleanupExpiredLabels();
}