package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

import com.realestate.duediligence.enums.LabelSource;
import com.realestate.duediligence.enums.LabelType;

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
public class PropertyLabelDto {
    private Long id;
    private Long propertyId;
    private LabelType type;
    private LabelSource source;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}