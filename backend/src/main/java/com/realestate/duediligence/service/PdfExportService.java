package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.DueDiligenceReportResponse;

public interface PdfExportService {

    byte[] generatePdfReport(DueDiligenceReportResponse report);

    byte[] generatePropertySnapshotPdf(DueDiligenceReportResponse report);
}