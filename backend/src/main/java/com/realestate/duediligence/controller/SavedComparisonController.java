package com.realestate.duediligence.controller;

import com.realestate.duediligence.dto.SavedComparisonRequest;
import com.realestate.duediligence.dto.SavedComparisonResponse;
import com.realestate.duediligence.service.SavedComparisonService;
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
public class SavedComparisonController {

    private final SavedComparisonService savedComparisonService;

    // ─── POST /api/comparisons ───────────────────────────────────────────────────
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> save(
            @Valid @RequestBody SavedComparisonRequest request) {

        SavedComparisonResponse response = savedComparisonService.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Comparison saved successfully",
                "data", response
        ));
    }

    // ─── GET /api/comparisons ────────────────────────────────────────────────────
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getMyComparisons() {

        List<SavedComparisonResponse> comparisons = savedComparisonService.getMyComparisons();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "count", comparisons.size(),
                "data", comparisons
        ));
    }

    // ─── GET /api/comparisons/{id} ───────────────────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {

        SavedComparisonResponse response = savedComparisonService.getById(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", response
        ));
    }

    // ─── PATCH /api/comparisons/{id} ────────────────────────────────────────────
    @PatchMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @Valid @RequestBody SavedComparisonRequest request) {

        SavedComparisonResponse response = savedComparisonService.update(id, request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Comparison updated successfully",
                "data", response
        ));
    }

    // ─── DELETE /api/comparisons/{id} ───────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {

        savedComparisonService.delete(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Comparison deleted successfully"
        ));
    }
}