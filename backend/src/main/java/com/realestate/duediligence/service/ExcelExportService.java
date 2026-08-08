package com.realestate.duediligence.service;

import com.realestate.duediligence.service.PdfReportDataProvider.PdfReportBundle;

public interface ExcelExportService {
    /**
     * Generates a premium multi-sheet Excel workbook for the given report bundle.
     * Returns the raw bytes of the .xlsx file.
     */
    byte[] generateExcelReport(PdfReportBundle bundle);
}