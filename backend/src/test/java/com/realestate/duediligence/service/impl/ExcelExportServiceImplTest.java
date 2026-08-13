// src/test/java/com/realestate/duediligence/service/impl/ExcelExportServiceImplTest.java
package com.realestate.duediligence.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayInputStream;
import java.util.List;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;

import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.dto.RiskBreakdownDto;
import com.realestate.duediligence.dto.RiskFactorDto;
import com.realestate.duediligence.enums.RiskCategory;
import com.realestate.duediligence.enums.RiskLevel;
import com.realestate.duediligence.service.PdfReportDataProvider.PdfReportBundle;

/**
 * Unit tests for ExcelExportServiceImpl.
 * Covers null guards, workbook structure, headers and data rows.
 */
class ExcelExportServiceImplTest {

    private final ExcelExportServiceImpl service = new ExcelExportServiceImpl();

    private PdfReportBundle bundle(RiskBreakdownDto breakdown) {
        DueDiligenceReportResponse report = DueDiligenceReportResponse.builder()
                .id(42L)
                .version(1)
                .title("Test Report")
                .propertyAddress("42 MG Road, Bengaluru")
                .build();
        return new PdfReportBundle(report, null, breakdown, null);
    }

    private XSSFWorkbook open(byte[] bytes) throws Exception {
        return new XSSFWorkbook(new ByteArrayInputStream(bytes));
    }

    @Test
    void should_throwIllegalArgument_whenBundleNull() {
        // Given / When / Then
        assertThatThrownBy(() -> service.generateExcelReport(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("bundle");
    }

    @Test
    void should_throwIllegalArgument_whenReportNull() {
        // Given — bundle without a report
        PdfReportBundle empty = new PdfReportBundle(null, null, null, null);

        // When / Then
        assertThatThrownBy(() -> service.generateExcelReport(empty))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("bundle.report");
    }

    @Test
    void should_generateXlsxWithThreeSheets() throws Exception {
        // Given — minimal bundle, no breakdown
        // When
        byte[] bytes = service.generateExcelReport(bundle(null));

        // Then — zip magic + the three institutional sheets
        assertThat(bytes[0]).isEqualTo((byte) 'P');
        assertThat(bytes[1]).isEqualTo((byte) 'K');
        try (XSSFWorkbook wb = open(bytes)) {
            assertThat(wb.getNumberOfSheets()).isEqualTo(3);
            assertThat(wb.getSheetName(0)).isEqualTo("Executive Dashboard");
            assertThat(wb.getSheetName(1)).isEqualTo("Detailed Analysis");
            assertThat(wb.getSheetName(2)).isEqualTo("Data Sources");
        }
    }

    @Test
    void should_renderRiskTableHeaders_onSheet1() throws Exception {
        // Given — minimal bundle
        // When
        byte[] bytes = service.generateExcelReport(bundle(null));

        // Then — header row at fixed row 23 (banner/KPI/property rows above)
        try (XSSFWorkbook wb = open(bytes)) {
            Row header = wb.getSheetAt(0).getRow(23);
            assertThat(header).isNotNull();
            assertThat(header.getCell(0).getStringCellValue()).isEqualTo("Category");
            assertThat(header.getCell(2).getStringCellValue()).isEqualTo("Weight");
            assertThat(header.getCell(3).getStringCellValue()).isEqualTo("Score");
            assertThat(header.getCell(4).getStringCellValue()).isEqualTo("Risk Level");
            assertThat(header.getCell(5).getStringCellValue()).isEqualTo("Data Source");
        }
    }

    @Test
    void should_writeFactorRows_whenBreakdownHasFactors() throws Exception {
        // Given — one flood factor with complete metadata
        RiskFactorDto factor = RiskFactorDto.builder()
                .category(RiskCategory.FLOOD)
                .score(40.0)
                .level(RiskLevel.MEDIUM)
                .weight(0.25)
                .explanation("Near river.")
                .recommendation("Buy insurance.")
                .dataSource("NDMA")
                .build();
        RiskBreakdownDto breakdown = RiskBreakdownDto.builder()
                .overallScore(42.5)
                .overallLevel(RiskLevel.MEDIUM)
                .factors(List.of(factor))
                .dataIncomplete(false)
                .unavailableProviderCount(0)
                .build();

        // When
        byte[] bytes = service.generateExcelReport(bundle(breakdown));

        // Then — first data row right below the header
        try (XSSFWorkbook wb = open(bytes)) {
            Row dataRow = wb.getSheetAt(0).getRow(24);
            assertThat(dataRow).isNotNull();
            assertThat(dataRow.getCell(0).getStringCellValue()).isEqualTo("Flood Risk");
            assertThat(dataRow.getCell(3).getStringCellValue()).isEqualTo("40.0");
            assertThat(dataRow.getCell(4).getStringCellValue()).isEqualTo("Medium");
        }
    }
}
