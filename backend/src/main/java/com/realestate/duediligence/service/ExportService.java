package com.realestate.duediligence.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.duediligence.dto.ExportRequest;
import com.realestate.duediligence.dto.ExportResponse;

public interface ExportService {

    byte[] exportReportPdf(Long reportId, Long userId);

    byte[] exportReportExcel(Long reportId, Long userId);

    ExportResponse getReportPreview(Long reportId, Long userId);

    byte[] exportBulk(ExportRequest request, Long userId);

    Page<ExportResponse> getExportHistory(Long userId, Pageable pageable);

    byte[] downloadExportFromHistory(Long exportId, Long userId);

}
