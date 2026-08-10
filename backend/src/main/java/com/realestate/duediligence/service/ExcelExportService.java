package com.realestate.duediligence.service;

import com.realestate.duediligence.dto.DueDiligenceReportResponse;

public interface ExcelExportService {

    byte[] generateExcelReport(DueDiligenceReportResponse report);

}