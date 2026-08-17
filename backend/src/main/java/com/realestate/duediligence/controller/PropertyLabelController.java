package com.realestate.duediligence.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.realestate.duediligence.dto.AddLabelRequest;
import com.realestate.duediligence.dto.PropertyLabelDto;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.service.PropertyLabelService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Property Labels",
        description = "Property label management. Labels (e.g. VERIFIED, HIGH_RISK, HOT_DEAL) are auto-computed " +
                "nightly and can also be applied/removed manually by ADMIN users.")
public class PropertyLabelController {

    private final PropertyLabelService labelService;

    @GetMapping("/properties/{propertyId}/labels")
    @Operation(
            summary = "Get labels for a property",
            description = "Returns all currently active labels for the given property. " +
                    "Public — no authentication required.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Label list returned (may be empty)"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<List<PropertyLabelDto>> getLabels(
            @Parameter(description = "Property ID", required = true) @PathVariable Long propertyId) {
        return ResponseEntity.ok(labelService.getLabelsForProperty(propertyId));
    }

    @PostMapping("/properties/{propertyId}/labels")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Add a manual label to a property (ADMIN only)",
            description = "Manually attaches a label of the specified type to a property. " +
                    "Optionally specify an expiry in days. Requires ADMIN role.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Label added — label DTO returned"),
            @ApiResponse(responseCode = "400", description = "Invalid label type or expiry value"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<PropertyLabelDto> addLabel(
            @Parameter(description = "Property ID", required = true) @PathVariable Long propertyId,
            @Valid @RequestBody AddLabelRequest request,
            @AuthenticationPrincipal User user) {
        Long userId = user != null ? user.getId() : null;
        PropertyLabelDto label = labelService.addManualLabel(
                propertyId, request.getType(), request.getExpiresInDays(), userId);
        return ResponseEntity.ok(label);
    }

    @DeleteMapping("/properties/{propertyId}/labels/{labelId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Remove a label from a property (ADMIN only)",
            description = "Deletes a specific label entry from a property. Requires ADMIN role.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Label removed successfully"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN"),
            @ApiResponse(responseCode = "404", description = "Property or label not found")
    })
    public ResponseEntity<Map<String, String>> removeLabel(
            @Parameter(description = "Property ID", required = true) @PathVariable Long propertyId,
            @Parameter(description = "Label ID", required = true) @PathVariable Long labelId) {
        labelService.removeLabel(propertyId, labelId);
        return ResponseEntity.ok(Map.of("message", "Label removed successfully"));
    }

    @PostMapping("/labels/recalculate-all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Recalculate auto-labels for all properties (ADMIN only)",
            description = "Triggers a full recalculation of automatically-assigned labels across all properties. " +
                    "Normally runs automatically each night at midnight. Use this to force an immediate run.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recalculation complete — property count returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN")
    })
    public ResponseEntity<Map<String, Object>> recalculateAll() {
        int count = labelService.recalculateAllAutoLabels();
        return ResponseEntity.ok(Map.of("message", "Recalculation complete", "propertiesProcessed", count));
    }

    @PostMapping("/labels/bulk")
    @Operation(
            summary = "Get labels for multiple properties (bulk)",
            description = "Returns a map of propertyId → label list for all provided property IDs. " +
                    "Efficient for populating labels on search results pages. No authentication required.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Map of property ID to labels returned"),
            @ApiResponse(responseCode = "400", description = "Empty or malformed property ID list")
    })
    public ResponseEntity<Map<Long, List<PropertyLabelDto>>> getBulkLabels(
            @RequestBody List<Long> propertyIds) {
        return ResponseEntity.ok(labelService.getLabelsForProperties(propertyIds));
    }
}
