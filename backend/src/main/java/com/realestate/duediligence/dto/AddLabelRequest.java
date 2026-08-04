package com.realestate.duediligence.dto;

import com.realestate.duediligence.enums.LabelType;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddLabelRequest {

    @NotNull(message = "Label type is required")
    private LabelType type;

    private Integer expiresInDays;  // null = never expires
}