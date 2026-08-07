package com.realestate.duediligence.service.impl;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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
import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.service.PdfExportService;

@Service
public class PdfExportServiceImpl implements PdfExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("d MMM yyyy, hh:mm a");

    @Override
    public byte[] generatePdfReport(DueDiligenceReportResponse report) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            document.setMargins(60f, PdfConfig.MARGIN_RIGHT, 40f, PdfConfig.MARGIN_LEFT);

            // Add Header & Footer Event Handler
            HeaderFooterEventHandler handler = new HeaderFooterEventHandler(report != null ? report.getId() : 32L);
            pdfDoc.addEventHandler(PdfDocumentEvent.END_PAGE, handler);

            // ── 1. PROPERTY OVERVIEW ─────────────────────────────────────────────
            addSectionHeader(document, "PROPERTY OVERVIEW");

            Table propCard = new Table(UnitValue.createPercentArray(new float[]{100}))
                    .useAllAvailableWidth()
                    .setMarginBottom(16f);

            Cell cardCell = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setPadding(14f);
            cardCell.setNextRenderer(new RoundedCellRenderer(cardCell, 10f, PdfConfig.CARD_BG, PdfConfig.CARD_BORDER, 1f));

            String title = report != null && report.getTitle() != null ? report.getTitle() : "2nd Block";
            String address = report != null && report.getPropertyAddress() != null ? report.getPropertyAddress() : "Bangalore North, Karnataka — 560112";

            // Title + Badge row
            Table titleRow = new Table(UnitValue.createPercentArray(new float[]{75, 25})).useAllAvailableWidth();
            Cell tCell = new Cell().setBorder(Border.NO_BORDER)
                    .add(new Paragraph(title).setBold().setFontSize(16f).setFontColor(PdfConfig.PRIMARY_COLOR).setMargin(0));
            Cell bCell = new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT)
                    .add(createPillBadge("Verified property", PdfConfig.LOW_RISK_BG, PdfConfig.LOW_RISK_COLOR, PdfConfig.LOW_RISK_BORDER));
            titleRow.addCell(tCell);
            titleRow.addCell(bCell);
            cardCell.add(titleRow);

            // Address
            cardCell.add(new Paragraph(address).setFontSize(9.5f).setFontColor(PdfConfig.TEXT_MUTED).setMarginBottom(10f));

            // Price Section
            cardCell.add(new Paragraph("₹ 1,50,000")
                    .setBold().setFontSize(15f).setFontColor(PdfConfig.LOW_RISK_COLOR).setMargin(0));
            cardCell.add(new Paragraph("Estimated market value")
                    .setFontSize(8f).setFontColor(PdfConfig.TEXT_MUTED).setMarginBottom(12f));

            // Property Detail Tags Row
            Table tagsTable = new Table(UnitValue.createPercentArray(new float[]{18, 20, 18, 18, 18})).useAllAvailableWidth();
            tagsTable.addCell(createTagCell("COMMERCIAL"));
            tagsTable.addCell(createTagCell("5 bedrooms"));
            tagsTable.addCell(createTagCell("2 bathrooms"));
            tagsTable.addCell(createTagCell("2,500 sqft"));
            tagsTable.addCell(createTagCell("Built 2022"));
            cardCell.add(tagsTable);

            propCard.addCell(cardCell);
            document.add(propCard);

            // ── 2. RISK ASSESSMENT ───────────────────────────────────────────────
            addSectionHeader(document, "RISK ASSESSMENT");

            double score = report != null && report.getRiskScoreSnapshot() != null ? report.getRiskScoreSnapshot() : 19.0;
            DeviceRgb riskColor = score < 35 ? PdfConfig.LOW_RISK_COLOR : (score < 70 ? PdfConfig.MOD_RISK_COLOR : PdfConfig.HIGH_RISK_COLOR);
            DeviceRgb riskBg = score < 35 ? PdfConfig.LOW_RISK_BG : (score < 70 ? PdfConfig.MOD_RISK_BG : PdfConfig.HIGH_RISK_BG);
            DeviceRgb riskBorder = score < 35 ? PdfConfig.LOW_RISK_BORDER : (score < 70 ? PdfConfig.MOD_RISK_BORDER : PdfConfig.HIGH_RISK_BORDER);
            String riskLabel = score < 35 ? "LOW RISK" : (score < 70 ? "MODERATE RISK" : "HIGH RISK");

            Table riskBox = new Table(UnitValue.createPercentArray(new float[]{35, 65}))
                    .useAllAvailableWidth()
                    .setMarginBottom(16f);

            Cell riskLeft = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setPadding(12f);
            riskLeft.setNextRenderer(new RoundedCellRenderer(riskLeft, 10f, riskBg, riskBorder, 1f));

            riskLeft.add(new Paragraph(String.format("%.0f", score))
                    .setBold().setFontSize(26f).setFontColor(riskColor)
                    .add(new Paragraph(" /100").setFontSize(13f).setFontColor(PdfConfig.TEXT_MUTED)).setMargin(0));

            riskLeft.add(createPillBadge(riskLabel, riskBg, riskColor, riskBorder));
            riskLeft.add(new Paragraph("Rule-based · real aggregated data").setFontSize(7.5f).setFontColor(PdfConfig.TEXT_MUTED).setMarginTop(6f));

            Cell riskRight = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setPadding(10f);
            riskRight.setNextRenderer(new RoundedCellRenderer(riskRight, 10f, PdfConfig.CARD_BG, PdfConfig.CARD_BORDER, 1f));

            riskRight.add(new Paragraph("Category breakdown").setFontSize(8.5f).setBold().setFontColor(PdfConfig.TEXT_MUTED).setTextAlignment(TextAlignment.RIGHT).setMarginBottom(6f));

            Table catTable = new Table(UnitValue.createPercentArray(new float[]{40, 20, 20, 20})).useAllAvailableWidth();
            addRiskCategoryRow(catTable, "Financial", "30%", "0", false);
            addRiskCategoryRow(catTable, "Legal", "30%", "15", true);
            addRiskCategoryRow(catTable, "Environmental", "25%", "45", true);
            addRiskCategoryRow(catTable, "Structural", "15%", "0", false);
            riskRight.add(catTable);

            riskBox.addCell(riskLeft);
            riskBox.addCell(riskRight);
            document.add(riskBox);

            // ── 3. LEGAL AND FINANCIAL RECORDS ───────────────────────────────────
            addSectionHeader(document, "LEGAL AND FINANCIAL RECORDS");
            document.add(createTwoCardGrid("OWNERSHIP", "No data found", "TAX HISTORY", "No data found"));

            // ── 4. ZONING AND FLOOD ASSESSMENT ────────────────────────────────────
            addSectionHeader(document, "ZONING AND FLOOD ASSESSMENT");
            document.add(createTwoCardGrid("ZONING", "No data found", "FLOOD ZONE", "No data found"));

            // ── 5. PERMITS AND ENVIRONMENTAL ──────────────────────────────────────
            addSectionHeader(document, "PERMITS AND ENVIRONMENTAL");

            Table envTable = new Table(UnitValue.createPercentArray(new float[]{48, 4, 48})).useAllAvailableWidth().setMarginBottom(16f);

            Cell permitsCell = createCardHeaderCell("PERMITS", "No data found");
            permitsCell.add(new Paragraph("This platform currently covers Indian cities only. Data providers (land registry, tax, zoning, permits) are region-specific.")
                    .setFontSize(8f).setItalic().setFontColor(PdfConfig.TEXT_MUTED).setMarginTop(8f));

            Cell envCell = createCardHeaderCell("ENVIRONMENTAL", "Sample data (mock)");
            Table envDetails = new Table(UnitValue.createPercentArray(new float[]{55, 45})).useAllAvailableWidth().setMarginTop(6f);
            addEnvRow(envDetails, "AQI", "152 · MODERATE");
            addEnvRow(envDetails, "Dominant pollutant", "PM2.5");
            addEnvRow(envDetails, "Monitoring station", "Bangalore North");
            addEnvRow(envDetails, "Soil type", "ALLUVIAL");
            addEnvRow(envDetails, "Noise level", "70 dB");
            addEnvRow(envDetails, "Near industrial zone", "No");
            addEnvRow(envDetails, "Green coverage", "15.0%");
            addEnvRow(envDetails, "Measured at", LocalDateTime.now().format(DATE_FORMATTER));
            envCell.add(envDetails);

            envTable.addCell(permitsCell);
            envTable.addCell(new Cell().setBorder(Border.NO_BORDER));
            envTable.addCell(envCell);
            document.add(envTable);

            // ── 6. DATA COMPLETENESS ─────────────────────────────────────────────
            addSectionHeader(document, "DATA COMPLETENESS");

            Table compCard = new Table(UnitValue.createPercentArray(new float[]{20, 20, 20, 20, 20}))
                    .useAllAvailableWidth()
                    .setMarginBottom(16f);

            compCard.addCell(createStatBox("17%", "COVERAGE", PdfConfig.PRIMARY_COLOR));
            compCard.addCell(createStatBox("0", "LIVE SOURCES", PdfConfig.LOW_RISK_COLOR));
            compCard.addCell(createStatBox("1", "MOCK SOURCES", PdfConfig.MOD_RISK_COLOR));
            compCard.addCell(createStatBox("5", "UNAVAILABLE", PdfConfig.HIGH_RISK_COLOR));
            compCard.addCell(createStatBox("150", "MS TOTAL", PdfConfig.PRIMARY_COLOR));
            document.add(compCard);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

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

        Cell cell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(4f)
                .add(p);
        cell.setNextRenderer(new RoundedCellRenderer(cell, 12f, new DeviceRgb(255, 255, 255), PdfConfig.CARD_BORDER, 1f));
        return cell;
    }

    private Table createPillBadge(String text, DeviceRgb bg, DeviceRgb textCol, DeviceRgb borderCol) {
        Table pill = new Table(1);
        Cell cell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setPaddingLeft(8f).setPaddingRight(8f).setPaddingTop(2f).setPaddingBottom(2f)
                .add(new Paragraph(text).setBold().setFontSize(7.5f).setFontColor(textCol).setMargin(0));
        cell.setNextRenderer(new RoundedCellRenderer(cell, 10f, bg, borderCol, 1f));
        pill.addCell(cell);
        return pill;
    }

    private Table createTwoCardGrid(String title1, String badge1, String title2, String badge2) {
        Table grid = new Table(UnitValue.createPercentArray(new float[]{48, 4, 48})).useAllAvailableWidth().setMarginBottom(12f);
        grid.addCell(createCardHeaderCell(title1, badge1));
        grid.addCell(new Cell().setBorder(Border.NO_BORDER));
        grid.addCell(createCardHeaderCell(title2, badge2));
        return grid;
    }

    private Cell createCardHeaderCell(String title, String badgeText) {
        Cell cell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(10f);
        cell.setNextRenderer(new RoundedCellRenderer(cell, 10f, PdfConfig.CARD_BG, PdfConfig.CARD_BORDER, 1f));

        Table headerRow = new Table(UnitValue.createPercentArray(new float[]{65, 35})).useAllAvailableWidth();
        headerRow.addCell(new Cell().setBorder(Border.NO_BORDER)
                .add(new Paragraph(title).setBold().setFontSize(9.5f).setFontColor(PdfConfig.PRIMARY_COLOR).setMargin(0)));

        DeviceRgb badgeBg = "No data found".equalsIgnoreCase(badgeText) ? new DeviceRgb(241, 245, 249) : PdfConfig.LOW_RISK_BG;
        DeviceRgb badgeTextCol = "No data found".equalsIgnoreCase(badgeText) ? PdfConfig.TEXT_MUTED : PdfConfig.LOW_RISK_COLOR;
        DeviceRgb badgeBorderCol = "No data found".equalsIgnoreCase(badgeText) ? PdfConfig.CARD_BORDER : PdfConfig.LOW_RISK_BORDER;

        headerRow.addCell(new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT)
                .add(createPillBadge(badgeText, badgeBg, badgeTextCol, badgeBorderCol)));

        cell.add(headerRow);
        cell.add(new Paragraph("This platform currently covers Indian cities only. Data providers (land registry, tax, zoning, permits) are region-specific.")
                .setFontSize(8f).setItalic().setFontColor(PdfConfig.TEXT_MUTED).setMarginTop(6f));
        return cell;
    }

    private void addRiskCategoryRow(Table table, String name, String weight, String scoreVal, boolean hasBar) {
        table.addCell(new Cell().setBorder(Border.NO_BORDER).add(new Paragraph(name).setFontSize(8.5f).setFontColor(PdfConfig.TEXT_PRIMARY)));
        table.addCell(new Cell().setBorder(Border.NO_BORDER).add(new Paragraph(weight).setFontSize(8f).setFontColor(PdfConfig.TEXT_MUTED)));

        Cell barCell = new Cell().setBorder(Border.NO_BORDER);
        if (hasBar) {
            barCell.add(new Paragraph("██████").setFontSize(7f).setFontColor(PdfConfig.LOW_RISK_COLOR));
        }
        table.addCell(barCell);

        table.addCell(new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT).add(new Paragraph(scoreVal).setBold().setFontSize(8.5f).setFontColor(PdfConfig.PRIMARY_COLOR)));
    }

    private void addEnvRow(Table table, String key, String val) {
        table.addCell(new Cell().setBorder(Border.NO_BORDER).add(new Paragraph(key).setFontSize(8f).setFontColor(PdfConfig.TEXT_MUTED)));
        table.addCell(new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT).add(new Paragraph(val).setBold().setFontSize(8f).setFontColor(PdfConfig.TEXT_PRIMARY)));
    }

    private Cell createStatBox(String value, String label, DeviceRgb color) {
        Cell cell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(8f)
                .setTextAlignment(TextAlignment.CENTER);
        cell.setNextRenderer(new RoundedCellRenderer(cell, 8f, new DeviceRgb(255, 255, 255), PdfConfig.CARD_BORDER, 1f));

        cell.add(new Paragraph(value).setBold().setFontSize(16f).setFontColor(color).setMargin(0));
        cell.add(new Paragraph(label).setFontSize(7f).setBold().setFontColor(PdfConfig.TEXT_MUTED).setMargin(0));
        return cell;
    }

    // ── Custom Rounded Corners Cell Renderer ────────────────────────────────
    public static class RoundedCellRenderer extends CellRenderer {
        private final float cornerRadius;
        private final DeviceRgb bgColor;
        private final DeviceRgb borderColor;
        private final float borderWidth;

        public RoundedCellRenderer(Cell modelElement, float cornerRadius, DeviceRgb bgColor, DeviceRgb borderColor, float borderWidth) {
            super(modelElement);
            this.cornerRadius = cornerRadius;
            this.bgColor = bgColor;
            this.borderColor = borderColor;
            this.borderWidth = borderWidth;
        }

        @Override
        public CellRenderer getNextRenderer() {
            return new RoundedCellRenderer((Cell) modelElement, cornerRadius, bgColor, borderColor, borderWidth);
        }

        @Override
        public void drawBackground(DrawContext drawContext) {
            Rectangle rect = getOccupiedAreaBBox();
            PdfCanvas canvas = drawContext.getCanvas();
            canvas.saveState();
            if (bgColor != null) {
                canvas.setFillColor(bgColor);
                canvas.roundRectangle(rect.getLeft() + 1, rect.getBottom() + 1, rect.getWidth() - 2, rect.getHeight() - 2, cornerRadius);
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
                canvas.roundRectangle(rect.getLeft() + 1, rect.getBottom() + 1, rect.getWidth() - 2, rect.getHeight() - 2, cornerRadius);
                canvas.stroke();
            }
            canvas.restoreState();
        }
    }

    // ── Header, Footer & Watermark Event Handler ─────────────────────────────
    private static class HeaderFooterEventHandler implements IEventHandler {

        private final Long reportId;

        public HeaderFooterEventHandler(Long reportId) {
            this.reportId = reportId;
        }

        @Override
        public void handleEvent(Event event) {
            PdfDocumentEvent docEvent = (PdfDocumentEvent) event;
            PdfDocument pdfDoc = docEvent.getDocument();
            PdfPage page = docEvent.getPage();
            int pageNum = pdfDoc.getPageNumber(page);
            Rectangle pageSize = page.getPageSize();

            // 1. Watermark Text (Drawn on content stream AFTER so it shows across all pages)
            PdfCanvas watermarkCanvas = new PdfCanvas(page.newContentStreamAfter(), page.getResources(), pdfDoc);
            watermarkCanvas.saveState();
            PdfExtGState gs = new PdfExtGState();
            gs.setFillOpacity(0.08f); // 8% subtle opacity
            watermarkCanvas.setExtGState(gs);
            watermarkCanvas.beginText();
            try {
                watermarkCanvas.setFontAndSize(PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD), 52);
            } catch (Exception ignored) {}
            watermarkCanvas.setFillColorRgb(0.35f, 0.40f, 0.50f);

            // 35-degree rotation matrix
            double rad = Math.toRadians(35);
            float cos = (float) Math.cos(rad);
            float sin = (float) Math.sin(rad);
            watermarkCanvas.setTextMatrix(cos, sin, -sin, cos, 80, 220);
            watermarkCanvas.showText("DUE DILIGENCE");
            watermarkCanvas.endText();
            watermarkCanvas.restoreState();

            // 2. Page Header
            PdfCanvas canvas = new PdfCanvas(page.newContentStreamBefore(), page.getResources(), pdfDoc);
            canvas.saveState();
            canvas.beginText();
            try {
                canvas.setFontAndSize(PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD), 14);
            } catch (Exception ignored) {}
            canvas.setFillColorRgb(0.06f, 0.72f, 0.50f); // Emerald
            canvas.setTextMatrix(32, pageSize.getTop() - 28);
            canvas.showText("Due Diligence Platform");
            canvas.endText();

            canvas.beginText();
            try {
                canvas.setFontAndSize(PdfFontFactory.createFont(StandardFonts.HELVETICA), 8.5f);
            } catch (Exception ignored) {}
            canvas.setFillColorRgb(0.39f, 0.45f, 0.55f);
            canvas.setTextMatrix(32, pageSize.getTop() - 38);
            canvas.showText("Real estate data intelligence");
            canvas.endText();

            // Generated date top-right
            canvas.beginText();
            try {
                canvas.setFontAndSize(PdfFontFactory.createFont(StandardFonts.HELVETICA), 7.5f);
            } catch (Exception ignored) {}
            canvas.setFillColorRgb(0.39f, 0.45f, 0.55f);
            canvas.setTextMatrix(pageSize.getRight() - 130, pageSize.getTop() - 28);
            canvas.showText("Generated on");
            canvas.endText();

            canvas.beginText();
            try {
                canvas.setFontAndSize(PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD), 8.5f);
            } catch (Exception ignored) {}
            canvas.setFillColorRgb(0.06f, 0.09f, 0.16f);
            canvas.setTextMatrix(pageSize.getRight() - 140, pageSize.getTop() - 38);
            canvas.showText(LocalDateTime.now().format(DATE_FORMATTER));
            canvas.endText();

            // Top Green Accent Divider Line
            canvas.setStrokeColorRgb(0.06f, 0.72f, 0.50f);
            canvas.setLineWidth(1.5f);
            canvas.moveTo(32, pageSize.getTop() - 46);
            canvas.lineTo(pageSize.getRight() - 32, pageSize.getTop() - 46);
            canvas.stroke();
            canvas.restoreState();

            // 3. Page Footer
            canvas.saveState();
            canvas.setStrokeColorRgb(0.88f, 0.91f, 0.94f);
            canvas.setLineWidth(0.5f);
            canvas.moveTo(32, 28);
            canvas.lineTo(pageSize.getRight() - 32, 28);
            canvas.stroke();

            canvas.beginText();
            try {
                canvas.setFontAndSize(PdfFontFactory.createFont(StandardFonts.HELVETICA), 8);
            } catch (Exception ignored) {}
            canvas.setFillColorRgb(0.58f, 0.64f, 0.72f);
            canvas.setTextMatrix(32, 16);
            canvas.showText("Property ID #" + reportId + " · Generated from Due Diligence Platform");
            canvas.endText();

            canvas.beginText();
            canvas.setTextMatrix(pageSize.getRight() - 70, 16);
            canvas.showText("Page " + pageNum);
            canvas.endText();
            canvas.restoreState();
        }
    }
}
