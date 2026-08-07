package com.realestate.duediligence.enums;

/**
 * Lifecycle status of a due diligence report generation.
 */
public enum ReportStatus {
    PENDING,      // Queued for generation
    GENERATING,   // Currently being built
    COMPLETED,    // Ready to view/download
    FAILED,       // Generation failed
    ARCHIVED      // Soft-deleted / user removed
}