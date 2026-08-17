package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.SavedComparisonRequest;
import com.realestate.duediligence.dto.SavedComparisonResponse;
import com.realestate.duediligence.service.SavedComparisonService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comparisons")
@RequiredArgsConstructor
@Tag(name = "Saved Comparisons",
        description = "Save, retrieve, update, and delete named property comparison sets. " +
                "All endpoints require authentication and BUYER, REAL_ESTATE_AGENT, or ADMIN role.")
public class SavedComparisonController {

    private final SavedComparisonService savedComparisonService;

    @PostMapping
    @PreAuthorize("hasAnyRole('BUYER', 'REAL_ESTATE_AGENT', 'ADMIN')")
    @Operation(
            summary = "Save a property comparison",
            description = "Creates a new named comparison set for the authenticated user. " +
                    "Stores a list of property IDs and an optional notes field.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Comparison saved — DTO returned"),
            @ApiResponse(responseCode = "400", description = "Validation failure"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Insufficient role")
    })
    public ResponseEntity<Map<String, Object>> save(
            @Valid @RequestBody SavedComparisonRequest request) {
        SavedComparisonResponse response = savedComparisonService.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true, "message", "Comparison saved successfully", "data", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('BUYER', 'REAL_ESTATE_AGENT', 'ADMIN')")
    @Operation(
            summary = "List my saved comparisons",
            description = "Returns all saved comparisons belonging to the authenticated user, newest first.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Comparison list returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Insufficient role")
    })
    public ResponseEntity<Map<String, Object>> getMyComparisons() {
        List<SavedComparisonResponse> comparisons = savedComparisonService.getMyComparisons();
        return ResponseEntity.ok(Map.of("success", true, "count", comparisons.size(), "data", comparisons));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('BUYER', 'REAL_ESTATE_AGENT', 'ADMIN')")
    @Operation(
            summary = "Get a saved comparison by ID",
            description = "Returns a single saved comparison. Only accessible by its owner.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Comparison returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Not the owner of this comparison"),
            @ApiResponse(responseCode = "404", description = "Comparison not found")
    })
    public ResponseEntity<Map<String, Object>> getById(
            @Parameter(description = "Saved comparison ID", required = true) @PathVariable Long id) {
        return ResponseEntity.ok(Map.of("success", true, "data", savedComparisonService.getById(id)));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('BUYER', 'REAL_ESTATE_AGENT', 'ADMIN')")
    @Operation(
            summary = "Update a saved comparison",
            description = "Updates the name, property IDs, or notes of an existing saved comparison.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Comparison updated — updated DTO returned"),
            @ApiResponse(responseCode = "400", description = "Validation failure"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Not the owner of this comparison"),
            @ApiResponse(responseCode = "404", description = "Comparison not found")
    })
    public ResponseEntity<Map<String, Object>> update(
            @Parameter(description = "Saved comparison ID", required = true) @PathVariable Long id,
            @Valid @RequestBody SavedComparisonRequest request) {
        return ResponseEntity.ok(Map.of("success", true, "message", "Comparison updated successfully",
                "data", savedComparisonService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('BUYER', 'REAL_ESTATE_AGENT', 'ADMIN')")
    @Operation(
            summary = "Delete a saved comparison",
            description = "Permanently deletes a saved comparison. Only the owner can delete it.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Comparison deleted"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Not the owner of this comparison"),
            @ApiResponse(responseCode = "404", description = "Comparison not found")
    })
    public ResponseEntity<Map<String, Object>> delete(
            @Parameter(description = "Saved comparison ID", required = true) @PathVariable Long id) {
        savedComparisonService.delete(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Comparison deleted successfully"));
    }
}
