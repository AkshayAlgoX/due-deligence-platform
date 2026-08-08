// backend/src/main/java/com/realestate/duediligence/pdf/renderer/CoverPageRenderer.java
package com.realestate.duediligence.pdf.renderer;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.AreaBreak;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.realestate.duediligence.config.PdfConfig;
import com.realestate.duediligence.config.PdfDesignSystem;
import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.pdf.util.PdfComponents;
import com.realestate.duediligence.service.ChartGenerator;
import com.realestate.duediligence.service.PdfReportDataProvider.PdfReportBundle;

/**
 * Renders the premium cover page.
 *
 * <p>Hierarchy (Session 25 Redesign):
 * 1. Eyebrow: "DUE DILIGENCE REPORT" (Small, Green, Spaced)
 * 2. H1: "Property Risk Assessment" (Static Document Title)
 * 3. Subtitle: Property Address (Medium, Muted)
 * 4. Metadata: Report ID & Version
 * 5. Gauge: Risk score centerpiece
 */
@Component
public class CoverPageRenderer implements SectionRenderer {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("MMMM d, yyyy").withZone(ZoneId.systemDefault());

    @Autowired
    private ChartGenerator chartGenerator;

    @Override
    public void render(Document document, PdfReportBundle bundle) {
        DueDiligenceReportResponse report = bundle.report;

        document.add(PdfComponents.spacer(PdfDesignSystem.SPACE_XL));

        // ── 1. Eyebrow Label ─────────────────────────────────────────────
        document.add(new Paragraph("DUE DILIGENCE REPORT")
                .setFont(PdfDesignSystem.fontSemibold())
                .setFontSize(PdfDesignSystem.FONT_CAPTION)
                .setFontColor(PdfConfig.BRAND_EMERALD)
                .setCharacterSpacing(PdfDesignSystem.TRACKING_EYEBROW)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(0));

        // ── 2. Primary H1 Title ──────────────────────────────────────────
        document.add(new Paragraph("Property Risk Assessment")
                .setFont(PdfDesignSystem.fontBold())
                .setFontSize(PdfDesignSystem.FONT_DISPLAY)
                .setFontColor(PdfDesignSystem.NAVY_900)
                .setTextAlignment(TextAlignment.CENTER)
                .setMultipliedLeading(PdfDesignSystem.LEADING_HEADER)
                .setMarginBottom(PdfDesignSystem.SPACE_XS));

        // ── 3. Property Address Subtitle ─────────────────────────────────
        String address = report != null && report.getPropertyAddress() != null 
                ? report.getPropertyAddress() : "Unspecified Property Location";
        
        document.add(new Paragraph(address)
                .setFont(PdfDesignSystem.fontMedium())
                .setFontSize(PdfDesignSystem.FONT_H2)
                .setFontColor(PdfConfig.TEXT_MUTED)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(PdfDesignSystem.SPACE_SM));

        // ── 4. Metadata Line ─────────────────────────────────────────────
        String metaInfo = String.format("Report #%s  ·  Version %d",
                (report != null && report.getId() != null ? report.getId() : "—"),
                (report != null && report.getVersion() != null ? report.getVersion() : 1));
        
        document.add(new Paragraph(metaInfo)
                .setFont(PdfDesignSystem.fontRegular())
                .setFontSize(PdfDesignSystem.FONT_BODY)
                .setFontColor(PdfConfig.TEXT_LIGHT)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(PdfDesignSystem.SPACE_XL));

        // ── 5. Risk Gauge ────────────────────────────────────────────────
        double score = report != null && report.getRiskScoreSnapshot() != null ? report.getRiskScoreSnapshot() : 0.0;
        try {
            byte[] gaugePng = chartGenerator.renderRiskGauge(score);
            if (gaugePng != null && gaugePng.length > 100) {
                Image gauge = new Image(ImageDataFactory.create(gaugePng));
                gauge.setWidth(300f);
                gauge.setHorizontalAlignment(HorizontalAlignment.CENTER);
                gauge.setMarginBottom(PdfDesignSystem.SPACE_XL);
                document.add(gauge);
            }
        } catch (Exception ignored) {}

        // ── 6. Bottom Metadata Grid ──────────────────────────────────────
        Table metaGrid = new Table(UnitValue.createPercentArray(new float[]{25, 25, 25, 25}))
                .useAllAvailableWidth()
                .setMarginBottom(PdfDesignSystem.SPACE_XL);

        metaGrid.addCell(metaCell("STATUS", report != null && report.getStatus() != null ? report.getStatus().name() : "FINAL"));
        metaGrid.addCell(metaCell("DATE", formatDate(report != null ? report.getCreatedAt() : Instant.now())));
        metaGrid.addCell(metaCell("ANALYST ID", "AI-AGENT-01"));
        metaGrid.addCell(metaCell("CONFIDENTIALITY", "RESTRICTED"));
        document.add(metaGrid);

        // ── 7. Prepared By Card ──────────────────────────────────────────
        Cell preparedBy = PdfComponents.card(PdfDesignSystem.SPACE_MD).setTextAlignment(TextAlignment.CENTER);
        preparedBy.add(PdfComponents.labelText("PREPARED BY"));
        preparedBy.add(new Paragraph(PdfConfig.BRAND_TITLE)
                .setFont(PdfDesignSystem.fontBold())
                .setFontSize(PdfDesignSystem.FONT_H3)
                .setFontColor(PdfConfig.BRAND_EMERALD)
                .setMargin(0));
        preparedBy.add(new Paragraph(PdfConfig.BRAND_SUBTITLE)
                .setFont(PdfDesignSystem.fontRegular())
                .setFontSize(PdfDesignSystem.FONT_BODY_SM)
                .setFontColor(PdfConfig.TEXT_MUTED)
                .setMargin(0));

        document.add(PdfComponents.wrapAsBlock(preparedBy));
        document.add(new AreaBreak());
    }

    private Cell metaCell(String label, String value) {
        Cell cell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.CENTER);
        cell.add(PdfComponents.labelText(label));
        cell.add(new Paragraph(value)
                .setFont(PdfDesignSystem.fontSemibold())
                .setFontSize(PdfDesignSystem.FONT_BODY_SM)
                .setFontColor(PdfDesignSystem.NAVY_900)
                .setMargin(0));
        return cell;
    }

    private String formatDate(Instant instant) {
        return instant == null ? "—" : DATE_FMT.format(instant);
    }
}