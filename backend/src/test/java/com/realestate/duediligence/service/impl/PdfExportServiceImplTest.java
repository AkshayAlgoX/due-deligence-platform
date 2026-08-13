// src/test/java/com/realestate/duediligence/service/impl/PdfExportServiceImplTest.java
package com.realestate.duediligence.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.itextpdf.layout.Document;
import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.pdf.renderer.AppendixRenderer;
import com.realestate.duediligence.pdf.renderer.CoverPageRenderer;
import com.realestate.duediligence.pdf.renderer.ExecutiveSummaryRenderer;
import com.realestate.duediligence.pdf.renderer.FinancialAnalysisRenderer;
import com.realestate.duediligence.pdf.renderer.PropertyOverviewRenderer;
import com.realestate.duediligence.pdf.renderer.RecommendationsRenderer;
import com.realestate.duediligence.pdf.renderer.RiskAnalysisRenderer;
import com.realestate.duediligence.pdf.util.PdfFontManager;
import com.realestate.duediligence.service.PdfReportDataProvider;
import com.realestate.duediligence.service.PdfReportDataProvider.PdfReportBundle;

/**
 * Unit tests for PdfExportServiceImpl.
 * Covers null guards, happy-path byte generation, deprecated bridge and error handling.
 */
@ExtendWith(MockitoExtension.class)
class PdfExportServiceImplTest {

    @Mock private PdfReportDataProvider dataProvider;
    @Mock private PdfFontManager pdfFontManager;
    @Mock private CoverPageRenderer coverPageRenderer;
    @Mock private ExecutiveSummaryRenderer executiveSummaryRenderer;
    @Mock private PropertyOverviewRenderer propertyOverviewRenderer;
    @Mock private RiskAnalysisRenderer riskAnalysisRenderer;
    @Mock private FinancialAnalysisRenderer financialAnalysisRenderer;
    @Mock private RecommendationsRenderer recommendationsRenderer;
    @Mock private AppendixRenderer appendixRenderer;

    @InjectMocks
    private PdfExportServiceImpl service;

    private DueDiligenceReportResponse report(long id) {
        return DueDiligenceReportResponse.builder().id(id).version(1).build();
    }

    @Test
    void should_throwIllegalArgument_whenReportIdNull() {
        // Given / When / Then
        assertThatThrownBy(() -> service.generatePdfReport((Long) null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("reportId must not be null");
    }

    @Test
    void should_generatePdfBytes_whenBundleAvailable() {
        // Given — a minimal bundle with only the report header info
        when(dataProvider.loadBundle(1L))
                .thenReturn(new PdfReportBundle(report(1L), null, null, null));

        // When
        byte[] bytes = service.generatePdfReport(1L);

        // Then — valid PDF header returned, bundle loaded once
        assertThat(bytes).isNotEmpty();
        assertThat(new String(bytes, 0, 4, StandardCharsets.ISO_8859_1)).isEqualTo("%PDF");
        verify(dataProvider).loadBundle(1L);
    }

    @Test
    void should_delegateDeprecatedBridge_toLongOverload() {
        // Given — legacy callers pass the full DTO
        DueDiligenceReportResponse dto = report(7L);
        when(dataProvider.loadBundle(7L))
                .thenReturn(new PdfReportBundle(dto, null, null, null));

        // When
        byte[] bytes = service.generatePdfReport(dto);

        // Then — delegates to the Long overload with the DTO's id
        assertThat(new String(bytes, 0, 4, StandardCharsets.ISO_8859_1)).isEqualTo("%PDF");
        verify(dataProvider).loadBundle(7L);
    }

    @Test
    void should_stillProducePdf_whenOneRendererFails() {
        // Given — the cover renderer blows up, others succeed
        when(dataProvider.loadBundle(1L))
                .thenReturn(new PdfReportBundle(report(1L), null, null, null));
        doThrow(new RuntimeException("renderer broke"))
                .when(coverPageRenderer).render(any(Document.class), any(PdfReportBundle.class));

        // When — a single section failure must not kill the report
        byte[] bytes = service.generatePdfReport(1L);

        // Then — PDF still produced
        assertThat(new String(bytes, 0, 4, StandardCharsets.ISO_8859_1)).isEqualTo("%PDF");
    }

    @Test
    void should_propagateProviderFailure_whenBundleLoadFails() {
        // Given — data provider fails before document creation
        when(dataProvider.loadBundle(1L)).thenThrow(new RuntimeException("boom"));

        // When / Then — raw provider error propagates
        assertThatThrownBy(() -> service.generatePdfReport(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("boom");
    }
}
