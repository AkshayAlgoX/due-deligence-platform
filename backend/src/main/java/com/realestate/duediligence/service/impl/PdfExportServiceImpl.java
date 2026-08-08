// backend/src/main/java/com/realestate/duediligence/service/impl/PdfExportServiceImpl.java
package com.realestate.duediligence.service.impl;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.events.Event;
import com.itextpdf.kernel.events.IEventHandler;
import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.kernel.pdf.extgstate.PdfExtGState;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.renderer.CellRenderer;
import com.itextpdf.layout.renderer.DrawContext;
import com.realestate.duediligence.config.PdfConfig;
import com.realestate.duediligence.config.PdfDesignSystem;
import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.pdf.renderer.AppendixRenderer;
import com.realestate.duediligence.pdf.renderer.CoverPageRenderer;
import com.realestate.duediligence.pdf.renderer.ExecutiveSummaryRenderer;
import com.realestate.duediligence.pdf.renderer.FinancialAnalysisRenderer;
import com.realestate.duediligence.pdf.renderer.PropertyOverviewRenderer;
import com.realestate.duediligence.pdf.renderer.RecommendationsRenderer;
import com.realestate.duediligence.pdf.renderer.RiskAnalysisRenderer;
import com.realestate.duediligence.pdf.renderer.SectionRenderer;
import com.realestate.duediligence.service.PdfExportService;
import com.realestate.duediligence.service.PdfReportDataProvider;
import com.realestate.duediligence.service.PdfReportDataProvider.PdfReportBundle;

/**
 * PDF export orchestrator.
 *
 * <p><b>Full report path</b> ({@link #generatePdfReport(Long)}):
 * <ol>
 *   <li>Load structured data bundle via {@link PdfReportDataProvider}</li>
 *   <li>Initialize document with margins tuned for premium report</li>
 *   <li>Attach header/footer/watermark event handler</li>
 *   <li>Run each {@link SectionRenderer} in the pipeline order</li>
 *   <li>Close document and return bytes</li>
 * </ol>
 *
 * <p><b>Snapshot path</b> ({@link #generatePropertySnapshotPdf(DueDiligenceReportResponse)}):
 * Preserved from the original implementation for the quick-preview feature.
 * Not part of the renderer pipeline.
 */
@Service
public class PdfExportServiceImpl implements PdfExportService {

    private static final Logger log = LoggerFactory.getLogger(PdfExportServiceImpl.class);

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("d MMM yyyy, hh:mm a");

    // ── Dependencies ─────────────────────────────────────────────────────

    @Autowired
    private PdfReportDataProvider dataProvider;

    // Renderers — injected in pipeline order.
    @Autowired private CoverPageRenderer          coverPageRenderer;
    @Autowired private ExecutiveSummaryRenderer   executiveSummaryRenderer;
    @Autowired private PropertyOverviewRenderer   propertyOverviewRenderer;
    @Autowired private RiskAnalysisRenderer       riskAnalysisRenderer;
    @Autowired private FinancialAnalysisRenderer  financialAnalysisRenderer;
    @Autowired private RecommendationsRenderer    recommendationsRenderer;
    @Autowired private AppendixRenderer           appendixRenderer;

    // ═══════════════════════════════════════════════════════════════
    // PREMIUM FULL REPORT — renderer pipeline
    // ═══════════════════════════════════════════════════════════════

    @Override
    public byte[] generatePdfReport(Long reportId) {
        if (reportId == null) {
            throw new IllegalArgumentException("reportId must not be null");
        }

        log.info("[pdf-export] Starting premium PDF generation for report {}", reportId);
        long start = System.currentTimeMillis();

        // ── Step 1: Load all structured data ─────────────────────────────
        PdfReportBundle bundle = dataProvider.loadBundle(reportId);

        // ── Step 2: Initialize document ──────────────────────────────────
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Slightly more generous top margin than before (60 → 68)
            // gives the header more breathing room on every page.
            document.setMargins(
                    68f,
                    PdfConfig.MARGIN_RIGHT,
                    48f,
                    PdfConfig.MARGIN_LEFT
            );

            // ── Step 3: Attach header/footer event handler ───────────────
            int version = bundle.report != null && bundle.report.getVersion() != null
                    ? bundle.report.getVersion() : 1;
            Long rId = bundle.report != null && bundle.report.getId() != null
                    ? bundle.report.getId() : reportId;

            HeaderFooterEventHandler handler = new HeaderFooterEventHandler(rId, version, true);
            pdfDoc.addEventHandler(PdfDocumentEvent.END_PAGE, handler);

            // ── Step 4: Run renderer pipeline ────────────────────────────
            List<SectionRenderer> pipeline = List.of(
                    coverPageRenderer,
                    executiveSummaryRenderer,
                    propertyOverviewRenderer,
                    riskAnalysisRenderer,
                    financialAnalysisRenderer,
                    recommendationsRenderer,
                    appendixRenderer
            );

            for (SectionRenderer renderer : pipeline) {
                try {
                    renderer.render(document, bundle);
                } catch (Exception e) {
                    // A single section failure must not kill the whole report.
                    log.error("[pdf-export] Renderer {} failed for report {}: {}",
                            renderer.getClass().getSimpleName(), reportId, e.getMessage(), e);
                }
            }

            document.close();

            long duration = System.currentTimeMillis() - start;
            log.info("[pdf-export] Report {} PDF generated in {}ms ({} bytes)",
                    reportId, duration, baos.size());

            return baos.toByteArray();

        } catch (Exception e) {
            log.error("[pdf-export] Failed to generate premium PDF for report {}: {}",
                    reportId, e.getMessage(), e);
            throw new RuntimeException("Failed to generate report PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Deprecated bridge — extracts the report ID and delegates.
     * Kept so any existing caller with a DTO in hand still works.
     */
    @Override
    @Deprecated
    public byte[] generatePdfReport(DueDiligenceReportResponse report) {
        if (report == null || report.getId() == null) {
            throw new IllegalArgumentException("Report or report.id must not be null");
        }
        log.warn("[pdf-export] Called deprecated generatePdfReport(DueDiligenceReportResponse) — "
                + "callers should switch to generatePdfReport(Long reportId)");
        return generatePdfReport(report.getId());
    }

    // ═══════════════════════════════════════════════════════════════
    // PROPERTY SNAPSHOT PDF (preserved from original — unchanged behavior)
    // ═══════════════════════════════════════════════════════════════

    @Override
    public byte[] generatePropertySnapshotPdf(DueDiligenceReportResponse report) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            document.setMargins(60f, PdfConfig.MARGIN_RIGHT, 40f, PdfConfig.MARGIN_LEFT);

            HeaderFooterEventHandler handler = new HeaderFooterEventHandler(
                    report != null ? report.getId() : 32L, 1, false);
            pdfDoc.addEventHandler(PdfDocumentEvent.END_PAGE, handler);

            addSectionHeader(document, "PROPERTY OVERVIEW SNAPSHOT");

            Table propCard = new Table(UnitValue.createPercentArray(new float[]{100}))
                    .useAllAvailableWidth().setMarginBottom(16f);
            Cell cardCell = new Cell().setBorder(Border.NO_BORDER).setPadding(14f);
            cardCell.setNextRenderer(new RoundedCellRenderer(
                    cardCell, 10f, PdfConfig.CARD_BG, PdfConfig.CARD_BORDER, 1f));

            String title = report != null && report.getTitle() != null
                    ? report.getTitle() : "2nd Block";
            String address = report != null && report.getPropertyAddress() != null
                    ? report.getPropertyAddress() : "Bangalore North, Karnataka — 560112";

            cardCell.add(new Paragraph(title).setBold().setFontSize(16f)
                    .setFontColor(PdfConfig.PRIMARY_COLOR).setMargin(0));
            cardCell.add(new Paragraph(address).setFontSize(9.5f)
                    .setFontColor(PdfConfig.TEXT_MUTED).setMarginBottom(10f));

            cardCell.add(new Paragraph("\u20B9 1,50,000").setBold().setFontSize(15f)
                    .setFontColor(PdfConfig.LOW_RISK_COLOR).setMargin(0));
            cardCell.add(new Paragraph("Estimated market value").setFontSize(8f)
                    .setFontColor(PdfConfig.TEXT_MUTED).setMarginBottom(12f));

            Table tagsTable = new Table(
                    UnitValue.createPercentArray(new float[]{18, 20, 18, 18, 18}))
                    .useAllAvailableWidth();
            tagsTable.addCell(createTagCell("COMMERCIAL"));
            tagsTable.addCell(createTagCell("5 bedrooms"));
            tagsTable.addCell(createTagCell("2 bathrooms"));
            tagsTable.addCell(createTagCell("2,500 sqft"));
            tagsTable.addCell(createTagCell("Built 2022"));
            cardCell.add(tagsTable);

            propCard.addCell(cardCell);
            document.add(propCard);

            addSectionHeader(document, "RISK ASSESSMENT");
            double score = report != null && report.getRiskScoreSnapshot() != null
                    ? report.getRiskScoreSnapshot() : 19.0;
            DeviceRgb riskColor = score < 35 ? PdfConfig.LOW_RISK_COLOR
                    : (score < 70 ? PdfConfig.MOD_RISK_COLOR : PdfConfig.HIGH_RISK_COLOR);
            DeviceRgb riskBg = score < 35 ? PdfConfig.LOW_RISK_BG
                    : (score < 70 ? PdfConfig.MOD_RISK_BG : PdfConfig.HIGH_RISK_BG);
            DeviceRgb riskBorder = score < 35 ? PdfConfig.LOW_RISK_BORDER
                    : (score < 70 ? PdfConfig.MOD_RISK_BORDER : PdfConfig.HIGH_RISK_BORDER);

            Table riskBox = new Table(UnitValue.createPercentArray(new float[]{35, 65}))
                    .useAllAvailableWidth().setMarginBottom(16f);
            Cell riskLeft = new Cell().setBorder(Border.NO_BORDER).setPadding(12f);
            riskLeft.setNextRenderer(new RoundedCellRenderer(
                    riskLeft, 10f, riskBg, riskBorder, 1f));
            riskLeft.add(new Paragraph(String.format("%.0f", score))
                    .setBold().setFontSize(26f).setFontColor(riskColor)
                    .add(new Paragraph(" /100").setFontSize(13f)
                            .setFontColor(PdfConfig.TEXT_MUTED))
                    .setMargin(0));
            riskLeft.add(createPillBadge(
                    score < 35 ? "LOW RISK" : "MODERATE RISK",
                    riskBg, riskColor, riskBorder));

            Cell riskRight = new Cell().setBorder(Border.NO_BORDER).setPadding(10f);
            riskRight.setNextRenderer(new RoundedCellRenderer(
                    riskRight, 10f, PdfConfig.CARD_BG, PdfConfig.CARD_BORDER, 1f));
            Table catTable = new Table(
                    UnitValue.createPercentArray(new float[]{40, 20, 20, 20}))
                    .useAllAvailableWidth();
            addRiskCategoryRow(catTable, "Financial",     "30%", "0",  false);
            addRiskCategoryRow(catTable, "Legal",         "30%", "15", true);
            addRiskCategoryRow(catTable, "Environmental", "25%", "45", true);
            addRiskCategoryRow(catTable, "Structural",    "15%", "0",  false);
            riskRight.add(catTable);

            riskBox.addCell(riskLeft);
            riskBox.addCell(riskRight);
            document.add(riskBox);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate property snapshot PDF", e);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // LEGACY HELPERS — used by snapshot method only
    // (Kept intact so snapshot behavior is 100% unchanged)
    // ═══════════════════════════════════════════════════════════════

    private void addSectionHeader(Document document, String title) {
        Paragraph p = new Paragraph(title)
                .setBold()
                .setFontSize(10f)
                .setFontColor(PdfConfig.PRIMARY_COLOR)
                .setMarginTop(10f)
                .setMarginBottom(6f);
        document.add(p);
    }

    private Cell createTagCell(String text) {
        Paragraph p = new Paragraph(text)
                .setFontSize(8f)
                .setFontColor(PdfConfig.TEXT_PRIMARY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMargin(0);
        Cell cell = new Cell().setBorder(Border.NO_BORDER).setPadding(4f).add(p);
        cell.setNextRenderer(new RoundedCellRenderer(
                cell, 12f, new DeviceRgb(255, 255, 255), PdfConfig.CARD_BORDER, 1f));
        return cell;
    }

    private Table createPillBadge(String text, DeviceRgb bg, DeviceRgb textCol, DeviceRgb borderCol) {
        Table pill = new Table(1);
        Cell cell = new Cell().setBorder(Border.NO_BORDER)
                .setPaddingLeft(8f).setPaddingRight(8f)
                .setPaddingTop(2f).setPaddingBottom(2f)
                .add(new Paragraph(text).setBold().setFontSize(7.5f)
                        .setFontColor(textCol).setMargin(0));
        cell.setNextRenderer(new RoundedCellRenderer(cell, 10f, bg, borderCol, 1f));
        pill.addCell(cell);
        return pill;
    }

    private void addRiskCategoryRow(Table table, String name, String weight,
                                     String scoreVal, boolean hasBar) {
        table.addCell(new Cell().setBorder(Border.NO_BORDER)
                .add(new Paragraph(name).setFontSize(8.5f)
                        .setFontColor(PdfConfig.TEXT_PRIMARY)));
        table.addCell(new Cell().setBorder(Border.NO_BORDER)
                .add(new Paragraph(weight).setFontSize(8f)
                        .setFontColor(PdfConfig.TEXT_MUTED)));
        Cell barCell = new Cell().setBorder(Border.NO_BORDER);
        if (hasBar) barCell.add(new Paragraph("\u2588\u2588\u2588\u2588\u2588\u2588")
                .setFontSize(7f).setFontColor(PdfConfig.LOW_RISK_COLOR));
        table.addCell(barCell);
        table.addCell(new Cell().setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT)
                .add(new Paragraph(scoreVal).setBold().setFontSize(8.5f)
                        .setFontColor(PdfConfig.PRIMARY_COLOR)));
    }

    // ═══════════════════════════════════════════════════════════════
    // ROUNDED CELL RENDERER (legacy, used by snapshot only)
    // Note: New renderers use PdfComponents.RoundedRenderer instead
    // ═══════════════════════════════════════════════════════════════

    public static class RoundedCellRenderer extends CellRenderer {
        private final float cornerRadius;
        private final DeviceRgb bgColor;
        private final DeviceRgb borderColor;
        private final float borderWidth;

        public RoundedCellRenderer(Cell modelElement, float cornerRadius,
                                    DeviceRgb bgColor, DeviceRgb borderColor, float borderWidth) {
            super(modelElement);
            this.cornerRadius = cornerRadius;
            this.bgColor = bgColor;
            this.borderColor = borderColor;
            this.borderWidth = borderWidth;
        }

        @Override
        public CellRenderer getNextRenderer() {
            return new RoundedCellRenderer((Cell) modelElement, cornerRadius,
                    bgColor, borderColor, borderWidth);
        }

        @Override
        public void drawBackground(DrawContext drawContext) {
            Rectangle rect = getOccupiedAreaBBox();
            PdfCanvas canvas = drawContext.getCanvas();
            canvas.saveState();
            if (bgColor != null) {
                canvas.setFillColor(bgColor);
                canvas.roundRectangle(rect.getLeft() + 1, rect.getBottom() + 1,
                        rect.getWidth() - 2, rect.getHeight() - 2, cornerRadius);
                canvas.fill();
            }
            canvas.restoreState();
        }

        @Override
        public void drawBorder(DrawContext drawContext) {
            Rectangle rect = getOccupiedAreaBBox();
            PdfCanvas canvas = drawContext.getCanvas();
            canvas.saveState();
            if (borderColor != null) {
                canvas.setStrokeColor(borderColor);
                canvas.setLineWidth(borderWidth);
                canvas.roundRectangle(rect.getLeft() + 1, rect.getBottom() + 1,
                        rect.getWidth() - 2, rect.getHeight() - 2, cornerRadius);
                canvas.stroke();
            }
            canvas.restoreState();
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // HEADER / FOOTER / WATERMARK EVENT HANDLER
    // (Preserved from original with watermark opacity reduced to 0.04)
    // ═══════════════════════════════════════════════════════════════

    private static class HeaderFooterEventHandler implements IEventHandler {

        private final Long reportId;
        private final int version;
        private final boolean isFullReport;

        public HeaderFooterEventHandler(Long reportId, int version, boolean isFullReport) {
            this.reportId = reportId;
            this.version = version;
            this.isFullReport = isFullReport;
        }

        @Override
        public void handleEvent(Event event) {
            PdfDocumentEvent docEvent = (PdfDocumentEvent) event;
            PdfDocument pdfDoc = docEvent.getDocument();
            PdfPage page = docEvent.getPage();
            int pageNum = pdfDoc.getPageNumber(page);
            Rectangle pageSize = page.getPageSize();

            // ── 1. Watermark (subtle diagonal on every page) ─────────────
            PdfCanvas watermarkCanvas = new PdfCanvas(
                    page.newContentStreamAfter(), page.getResources(), pdfDoc);
            watermarkCanvas.saveState();
            PdfExtGState gs = new PdfExtGState();
            // Tuned from 0.08 → PdfDesignSystem.WATERMARK_OPACITY (0.04) for subtler look
            gs.setFillOpacity(PdfDesignSystem.WATERMARK_OPACITY);
            watermarkCanvas.setExtGState(gs);
            watermarkCanvas.beginText();
            try {
                watermarkCanvas.setFontAndSize(
                        PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD), 52);
            } catch (Exception ignored) {}
            watermarkCanvas.setFillColorRgb(0.35f, 0.40f, 0.50f);

            double rad = Math.toRadians(35);
            float cos = (float) Math.cos(rad);
            float sin = (float) Math.sin(rad);
            watermarkCanvas.setTextMatrix(cos, sin, -sin, cos, 80, 220);
            watermarkCanvas.showText(PdfDesignSystem.WATERMARK_TEXT);
            watermarkCanvas.endText();
            watermarkCanvas.restoreState();

            // ── 2. Page header ───────────────────────────────────────────
            PdfCanvas canvas = new PdfCanvas(
                    page.newContentStreamBefore(), page.getResources(), pdfDoc);
            canvas.saveState();

            // Brand title (left)
            canvas.beginText();
            try {
                canvas.setFontAndSize(
                        PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD), 14);
            } catch (Exception ignored) {}
            canvas.setFillColorRgb(0.06f, 0.72f, 0.50f);  // Brand emerald
            canvas.setTextMatrix(32, pageSize.getTop() - 28);
            canvas.showText(PdfConfig.BRAND_TITLE);
            canvas.endText();

            // Brand subtitle
            canvas.beginText();
            try {
                canvas.setFontAndSize(
                        PdfFontFactory.createFont(StandardFonts.HELVETICA), 8.5f);
            } catch (Exception ignored) {}
            canvas.setFillColorRgb(0.39f, 0.45f, 0.55f);
            canvas.setTextMatrix(32, pageSize.getTop() - 38);
            canvas.showText(PdfConfig.BRAND_SUBTITLE
                    + (isFullReport
                        ? " \u00B7 Version v" + version + " \u00B7 Report #" + reportId
                        : ""));
            canvas.endText();

            // Generated date (right)
            canvas.beginText();
            try {
                canvas.setFontAndSize(
                        PdfFontFactory.createFont(StandardFonts.HELVETICA), 7.5f);
            } catch (Exception ignored) {}
            canvas.setFillColorRgb(0.39f, 0.45f, 0.55f);
            canvas.setTextMatrix(pageSize.getRight() - 130, pageSize.getTop() - 28);
            canvas.showText("Generated on");
            canvas.endText();

            canvas.beginText();
            try {
                canvas.setFontAndSize(
                        PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD), 8.5f);
            } catch (Exception ignored) {}
            canvas.setFillColorRgb(0.06f, 0.09f, 0.16f);
            canvas.setTextMatrix(pageSize.getRight() - 140, pageSize.getTop() - 38);
            canvas.showText(LocalDateTime.now().format(DATE_FORMATTER));
            canvas.endText();

            // Green accent line
            canvas.setStrokeColorRgb(0.06f, 0.72f, 0.50f);
            canvas.setLineWidth(1.5f);
            canvas.moveTo(32, pageSize.getTop() - 46);
            canvas.lineTo(pageSize.getRight() - 32, pageSize.getTop() - 46);
            canvas.stroke();
            canvas.restoreState();

            // ── 3. Page footer ───────────────────────────────────────────
            canvas.saveState();
            canvas.setStrokeColorRgb(0.88f, 0.91f, 0.94f);
            canvas.setLineWidth(0.5f);
            canvas.moveTo(32, 28);
            canvas.lineTo(pageSize.getRight() - 32, 28);
            canvas.stroke();

            canvas.beginText();
            try {
                canvas.setFontAndSize(
                        PdfFontFactory.createFont(StandardFonts.HELVETICA), 8);
            } catch (Exception ignored) {}
            canvas.setFillColorRgb(0.58f, 0.64f, 0.72f);
            canvas.setTextMatrix(32, 16);
            canvas.showText("Report #" + reportId + " \u00B7 Generated from "
                    + PdfConfig.BRAND_TITLE);
            canvas.endText();

            canvas.beginText();
            canvas.setTextMatrix(pageSize.getRight() - 70, 16);
            canvas.showText("Page " + pageNum);
            canvas.endText();
            canvas.restoreState();
        }
    }
}