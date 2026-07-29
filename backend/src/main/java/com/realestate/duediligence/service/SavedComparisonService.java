package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.SavedComparisonRequest;
import com.realestate.duediligence.dto.SavedComparisonResponse;

import java.util.List;

public interface SavedComparisonService {

    SavedComparisonResponse save(SavedComparisonRequest request);

    List<SavedComparisonResponse> getMyComparisons();

    SavedComparisonResponse getById(Long id);

    SavedComparisonResponse update(Long id, SavedComparisonRequest request);

    void delete(Long id);
}