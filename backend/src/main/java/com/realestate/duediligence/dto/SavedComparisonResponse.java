package com.realestate.duediligence.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SavedComparisonResponse {

    private Long id;
    private String name;
    private String notes;
    private List<Long> propertyIds;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}