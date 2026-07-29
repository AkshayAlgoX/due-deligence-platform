package com.realestate.duediligence.service.impl;

import com.realestate.duediligence.dto.SavedComparisonRequest;
import com.realestate.duediligence.dto.SavedComparisonResponse;
import com.realestate.duediligence.entity.SavedComparison;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.SavedComparisonRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.SavedComparisonService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedComparisonServiceImpl implements SavedComparisonService {

    private final SavedComparisonRepository savedComparisonRepository;
    private final UserRepository userRepository;

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private User resolveCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return null;
            String email = auth.getName();
            return userRepository.findByEmail(email).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private String toCsv(List<Long> ids) {
        return ids.stream()
                .map(String::valueOf)
                .collect(Collectors.joining(","));
    }

    private List<Long> fromCsv(String csv) {
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .map(Long::parseLong)
                .collect(Collectors.toList());
    }

    private SavedComparisonResponse toResponse(SavedComparison entity) {
        return SavedComparisonResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .notes(entity.getNotes())
                .propertyIds(fromCsv(entity.getPropertyIds()))
                .userId(entity.getUser().getId())
                .userName(entity.getUser().getFullName())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    // ─── Service Methods ─────────────────────────────────────────────────────────

    @Override
    public SavedComparisonResponse save(SavedComparisonRequest request) {
        User currentUser = resolveCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("Not authenticated");
        }

        if (savedComparisonRepository.existsByUserIdAndName(currentUser.getId(), request.getName())) {
            throw new IllegalArgumentException("You already have a comparison named \"" + request.getName() + "\"");
        }

        SavedComparison comparison = new SavedComparison();
        comparison.setUser(currentUser);
        comparison.setName(request.getName());
        comparison.setNotes(request.getNotes());
        comparison.setPropertyIds(toCsv(request.getPropertyIds()));

        SavedComparison saved = savedComparisonRepository.save(comparison);
        return toResponse(saved);
    }

    @Override
    public List<SavedComparisonResponse> getMyComparisons() {
        User currentUser = resolveCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("Not authenticated");
        }

        return savedComparisonRepository
                .findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SavedComparisonResponse getById(Long id) {
        User currentUser = resolveCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("Not authenticated");
        }

        boolean isAdmin = "ADMIN".equals(currentUser.getRole().getRoleName().name());

        SavedComparison comparison;
        if (isAdmin) {
            comparison = savedComparisonRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Comparison not found with id: " + id));
        } else {
            comparison = savedComparisonRepository.findByIdAndUserId(id, currentUser.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Comparison not found with id: " + id));
        }

        return toResponse(comparison);
    }

    @Override
    public SavedComparisonResponse update(Long id, SavedComparisonRequest request) {
        User currentUser = resolveCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("Not authenticated");
        }

        SavedComparison comparison = savedComparisonRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("Comparison not found with id: " + id));

        if (!comparison.getName().equals(request.getName()) &&
                savedComparisonRepository.existsByUserIdAndName(currentUser.getId(), request.getName())) {
            throw new IllegalArgumentException("You already have a comparison named \"" + request.getName() + "\"");
        }

        comparison.setName(request.getName());
        comparison.setNotes(request.getNotes());
        comparison.setPropertyIds(toCsv(request.getPropertyIds()));

        SavedComparison updated = savedComparisonRepository.save(comparison);
        return toResponse(updated);
    }

    @Override
    public void delete(Long id) {
        User currentUser = resolveCurrentUser();
        if (currentUser == null) {
            throw new AccessDeniedException("Not authenticated");
        }

        boolean isAdmin = "ADMIN".equals(currentUser.getRole().getRoleName().name());

        SavedComparison comparison;
        if (isAdmin) {
            comparison = savedComparisonRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Comparison not found with id: " + id));
        } else {
            comparison = savedComparisonRepository.findByIdAndUserId(id, currentUser.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Comparison not found with id: " + id));
        }

        savedComparisonRepository.delete(comparison);
    }
}