package com.realestate.duediligence.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExportRequest {

    private List<Long> reportIds;
    private String format;
    private Boolean includeRiskGauge;
    private Boolean includeTables;
    private Boolean includeCharts;
    private String customTitle;

}
