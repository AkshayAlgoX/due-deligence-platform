package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportHistoryDto {

    private Long id;

    private Long propertyId;

    private String propertyTitle;

    private Long userId;

    private String generatedBy;

    private String reportType;

    private String fileName;

    private String status;

    private LocalDateTime createdAt;
}