package com.realestate.duediligence.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.dto.ReportSummaryDto;
import com.realestate.duediligence.repository.ExportHistoryRepository;
import com.realestate.duediligence.service.DueDiligenceReportService;
import com.realestate.duediligence.service.ExcelExportService;
import com.realestate.duediligence.service.PdfExportService;
import com.realestate.duediligence.service.PdfReportDataProvider;

/**
 * Property snapshot exports must use a report the caller may read, or fail.
 * Previously an empty or denied lookup fell back to a hard-coded placeholder
 * report whose id was the property id.
 */
@ExtendWith(MockitoExtension.class)
class ExportServiceImplTest {

    @Mock private DueDiligenceReportService reportService;
    @Mock private PdfExportService pdfExportService;
    @Mock private ExcelExportService excelExportService;
    @Mock private ExportHistoryRepository exportHistoryRepository;
    @Mock private PdfReportDataProvider pdfReportDataProvider;

    @InjectMocks private ExportServiceImpl exportService;

    @Test
    void snapshotPdf_withNoReadableReport_failsInsteadOfUsingPlaceholder() {
        when(reportService.getReportsForProperty(7L)).thenReturn(List.of());

        assertThatThrownBy(() -> exportService.exportPropertySnapshotPdf(7L, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("property 7");
        verifyNoInteractions(pdfExportService, exportHistoryRepository);
    }

    @Test
    void snapshotExcel_withNoReadableReport_neverLoadsReportWithPropertyId() {
        when(reportService.getReportsForProperty(7L)).thenReturn(List.of());

        assertThatThrownBy(() -> exportService.exportPropertySnapshotExcel(7L, 1L))
                .isInstanceOf(IllegalArgumentException.class);
        verify(pdfReportDataProvider, never()).loadBundle(anyLong());
        verifyNoInteractions(excelExportService);
    }

    @Test
    void snapshotPdf_propagatesAccessDenial() {
        when(reportService.getReportsForProperty(7L)).thenReturn(List.of(summary(40L)));
        when(reportService.getReport(40L)).thenThrow(new RuntimeException("Report not found: 40"));

        assertThatThrownBy(() -> exportService.exportPropertySnapshotPdf(7L, 1L))
                .hasMessage("Report not found: 40");
        verifyNoInteractions(pdfExportService);
    }

    @Test
    void snapshotPdf_usesLatestReadableReport() {
        DueDiligenceReportResponse report = DueDiligenceReportResponse.builder().id(40L).build();
        when(reportService.getReportsForProperty(7L)).thenReturn(List.of(summary(40L), summary(39L)));
        when(reportService.getReport(40L)).thenReturn(report);
        when(pdfExportService.generatePropertySnapshotPdf(report)).thenReturn(new byte[] {1, 2, 3});

        assertThat(exportService.exportPropertySnapshotPdf(7L, 1L)).containsExactly(1, 2, 3);
        verify(pdfExportService).generatePropertySnapshotPdf(report);
        verify(exportHistoryRepository).save(any());
    }

    private static ReportSummaryDto summary(Long id) {
        ReportSummaryDto dto = new ReportSummaryDto();
        dto.setId(id);
        return dto;
    }
}
