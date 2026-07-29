package com.realestate.duediligence.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class SavedComparisonRequest {

    @NotBlank(message = "Comparison name is required")
    @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
    private String name;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;

    @NotEmpty(message = "At least 2 property IDs are required")
    @Size(min = 2, max = 3, message = "You can compare 2 to 3 properties only")
    private List<Long> propertyIds;
}