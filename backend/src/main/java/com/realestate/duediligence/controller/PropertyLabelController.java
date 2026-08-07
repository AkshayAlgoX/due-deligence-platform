package com.realestate.duediligence.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.duediligence.dto.AddLabelRequest;
import com.realestate.duediligence.dto.PropertyLabelDto;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.service.PropertyLabelService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PropertyLabelController {

    private final PropertyLabelService labelService;

    // Public: Anyone can view labels
    @GetMapping("/properties/{propertyId}/labels")
    public ResponseEntity<List<PropertyLabelDto>> getLabels(@PathVariable Long propertyId) {
        return ResponseEntity.ok(labelService.getLabelsForProperty(propertyId));
    }

    // Admin: Add manual label
    @PostMapping("/properties/{propertyId}/labels")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PropertyLabelDto> addLabel(
        @PathVariable Long propertyId,
        @Valid @RequestBody AddLabelRequest request,
        @AuthenticationPrincipal User user
    ) {
        Long userId = user != null ? user.getId() : null;
        PropertyLabelDto label = labelService.addManualLabel(
            propertyId,
            request.getType(),
            request.getExpiresInDays(),
            userId
        );
        return ResponseEntity.ok(label);
    }

    // Admin: Remove label
    @DeleteMapping("/properties/{propertyId}/labels/{labelId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> removeLabel(
        @PathVariable Long propertyId,
        @PathVariable Long labelId
    ) {
        labelService.removeLabel(propertyId, labelId);
        return ResponseEntity.ok(Map.of("message", "Label removed successfully"));
    }

    // Admin: Trigger full recalculation
    @PostMapping("/labels/recalculate-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> recalculateAll() {
        int count = labelService.recalculateAllAutoLabels();
        return ResponseEntity.ok(Map.of(
            "message", "Recalculation complete",
            "propertiesProcessed", count
        ));
    }

    // Public: Get bulk labels for multiple properties (used in search results)
    @PostMapping("/labels/bulk")
    public ResponseEntity<Map<Long, List<PropertyLabelDto>>> getBulkLabels(
        @RequestBody List<Long> propertyIds
    ) {
        return ResponseEntity.ok(labelService.getLabelsForProperties(propertyIds));
    }
}