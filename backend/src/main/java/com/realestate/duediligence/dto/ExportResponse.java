package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExportResponse {

    private Long exportId;
    private String reportId;
    private String format;
    private String downloadUrl;
    private String fileName;
    private Long fileSizeBytes;
    private LocalDateTime createdAt;
    private String status;
    private String message;
    private Integer estimatedPages;
    private Integer sectionsCount;
    private String summary;
    private Integer downloadCount;

}
