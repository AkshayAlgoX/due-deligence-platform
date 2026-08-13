package com.realestate.duediligence.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AiSummaryResponse {

    /** PROCEED | CAUTION | HIGH_RISK */
    private String verdict;

    /** One-line executive verdict, e.g. "Property is legally sound with moderate flood risk." */
    private String headline;

    /** 3-5 short bullet points highlighting key findings. */
    private List<String> keyPoints;

    /** Final recommendation paragraph. */
    private String recommendation;

    /** When this summary was generated. */
    private LocalDateTime generatedAt;

    /** Was this served from cache? */
    private boolean cached;
}