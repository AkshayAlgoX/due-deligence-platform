package com.realestate.duediligence.templates.pdf;

import java.time.format.DateTimeFormatter;

import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.realestate.duediligence.config.PdfConfig;
import com.realestate.duediligence.dto.DueDiligenceReportResponse;

public class CoverPageTemplate {

    public static void buildCoverPage(Document document, DueDiligenceReportResponse report) {
        // Top banner / Spacing
        document.add(new Paragraph("\n\n"));

        // Main Title Banner
        Table titleTable = new Table(UnitValue.createPercentArray(new float[]{100}))
                .useAllAvailableWidth();
        
        Cell titleCell = new Cell()
                .setBackgroundColor(PdfConfig.PRIMARY_COLOR)
                .setPadding(24f)
                .setTextAlignment(TextAlignment.CENTER);

        Paragraph brandText = new Paragraph(PdfConfig.BRAND_NAME.toUpperCase())
                .setFontColor(PdfConfig.SECONDARY_COLOR)
                .setFontSize(11f)
                .setBold()
                .setMarginBottom(8f);

        Paragraph mainTitle = new Paragraph("PROPERTY DUE DILIGENCE REPORT")
                .setFontColor(new DeviceRgb(255, 255, 255))
                .setFontSize(22f)
                .setBold()
                .setMarginBottom(4f);

        String subtitleText = report != null && report.getTitle() != null
                ? report.getTitle()
                : "Comprehensive Property Assessment & Risk Analysis";

        Paragraph subtitle = new Paragraph(subtitleText)
                .setFontColor(new DeviceRgb(203, 213, 225))
                .setFontSize(13f);

        titleCell.add(brandText);
        titleCell.add(mainTitle);
        titleCell.add(subtitle);
        titleTable.addCell(titleCell);
        document.add(titleTable);

        document.add(new Paragraph("\n\n"));

        // Property Metadata Box
        Table metaTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                .useAllAvailableWidth();

        double score = report != null && report.getRiskScoreSnapshot() != null ? report.getRiskScoreSnapshot() : 0.0;
        String riskLevel = score < 35 ? "LOW RISK" : (score < 70 ? "MODERATE RISK" : "HIGH RISK");
        String dateStr = report != null && report.getCreatedAt() != null ? DateTimeFormatter.ISO_INSTANT.format(report.getCreatedAt()) : "N/A";

        addMetaRow(metaTable, "Report ID:", report != null && report.getId() != null ? report.getId().toString() : "N/A");
        addMetaRow(metaTable, "Property Title:", report != null && report.getTitle() != null ? report.getTitle() : "Property Assessment");
        addMetaRow(metaTable, "Address / Location:", report != null && report.getPropertyAddress() != null ? report.getPropertyAddress() : "Location Details Enclosed");
        addMetaRow(metaTable, "Overall Risk Score:", String.format("%.1f / 100", score));
        addMetaRow(metaTable, "Overall Risk Level:", riskLevel);
        addMetaRow(metaTable, "Generated Date:", dateStr);

        document.add(metaTable);

        document.add(new Paragraph("\n\n\n"));

        // Confidentiality Disclaimer
        Paragraph disclaimer = new Paragraph("CONFIDENTIAL DOCUMENT — For Authorized Recipient Use Only.\n" +
                "This document contains privileged real estate due diligence findings, valuation models, risk scoring, and legal assessment records.")
                .setFontSize(9f)
                .setFontColor(PdfConfig.TEXT_MUTED)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(disclaimer);

        // Page break after cover page
        document.add(new com.itextpdf.layout.element.AreaBreak());
    }

    private static void addMetaRow(Table table, String label, String value) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label).setBold().setFontSize(10f).setFontColor(PdfConfig.TEXT_PRIMARY))
                .setBackgroundColor(PdfConfig.LIGHT_BG)
                .setPadding(8f)
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);

        Cell valueCell = new Cell()
                .add(new Paragraph(value).setFontSize(10f).setFontColor(PdfConfig.TEXT_PRIMARY))
                .setBackgroundColor(PdfConfig.LIGHT_BG)
                .setPadding(8f)
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }
}
