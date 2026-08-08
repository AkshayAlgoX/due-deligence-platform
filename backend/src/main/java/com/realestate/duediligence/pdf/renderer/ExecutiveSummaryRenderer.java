// backend/src/main/java/com/realestate/duediligence/pdf/renderer/ExecutiveSummaryRenderer.java
package com.realestate.duediligence.pdf.renderer;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.realestate.duediligence.config.PdfConfig;
import com.realestate.duediligence.config.PdfDesignSystem;
import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.dto.RiskBreakdownDto;
import com.realestate.duediligence.dto.RiskFactorDto;
import com.realestate.duediligence.enums.RiskLevel;
import com.realestate.duediligence.pdf.util.HumanizeText;
import com.realestate.duediligence.pdf.util.PdfComponents;
import com.realestate.duediligence.pdf.util.PdfComponents.CalloutStyle;
import com.realestate.duediligence.service.PdfReportDataProvider.PdfReportBundle;

/**
 * Executive Summary — Dashboard View.
 *
 * Session 25 Improvements:
 * - Removed redundant "Summary" card.
 * - Fixed centered alignment for the Overall Risk Pill.
 * - Humanized "Key Risk Findings" callout text.
 * - Migrated all styles to Inter font family.
 */
@Component
public class ExecutiveSummaryRenderer implements SectionRenderer {

    @Override
    public void render(Document document, PdfReportBundle bundle) {
        DueDiligenceReportResponse report = bundle.report;
        RiskBreakdownDto breakdown = bundle.breakdown;

        document.add(PdfComponents.sectionHeader("Executive Summary"));

        // ── Dashboard Split Panel ────────────────────────────────────────
        Table dashboard = new Table(UnitValue.createPercentArray(new float[]{38, 62}))
                .useAllAvailableWidth()
                .setMarginBottom(PdfDesignSystem.SPACE_MD);

        // LEFT: Overall Score Card
        double overallScore = report != null && report.getRiskScoreSnapshot() != null
                ? report.getRiskScoreSnapshot() : 0.0;
        RiskLevel overallLevel = breakdown != null && breakdown.getOverallLevel() != null
                ? breakdown.getOverallLevel()
                : PdfDesignSystem.levelFromScore(overallScore);

        Cell scoreCell = PdfComponents.colorCard(
                PdfDesignSystem.bgForLevel(overallLevel),
                PdfDesignSystem.borderForLevel(overallLevel),
                PdfDesignSystem.SPACE_LG
        ).setTextAlignment(TextAlignment.CENTER).setVerticalAlignment(VerticalAlignment.MIDDLE);

        scoreCell.add(PdfComponents.labelText("OVERALL RISK SCORE"));

        scoreCell.add(new Paragraph(String.format("%.1f", overallScore))
                .setFont(PdfDesignSystem.fontBold())
                .setFontSize(48f)
                .setFontColor(PdfDesignSystem.colorForLevel(overallLevel))
                .setMargin(0));

        scoreCell.add(new Paragraph("out of 100")
                .setFont(PdfDesignSystem.fontRegular())
                .setFontSize(PdfDesignSystem.FONT_BODY_SM)
                .setFontColor(PdfConfig.TEXT_MUTED)
                .setMarginBottom(PdfDesignSystem.SPACE_SM));

        // FIXED: Centered pill — single full-width cell, badge centers itself
        Table pillContainer = new Table(UnitValue.createPercentArray(new float[]{100}))
                .useAllAvailableWidth();
        Cell pillCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.CENTER)
                .add(PdfComponents.riskBadge(overallLevel));
        pillContainer.addCell(pillCell);
        scoreCell.add(pillContainer);

        dashboard.addCell(scoreCell);

        // RIGHT: Risk Category Breakdown
        Cell categoriesCell = PdfComponents.card(PdfDesignSystem.SPACE_MD);
        categoriesCell.add(PdfComponents.labelText("RISK CATEGORIES"));

        if (breakdown != null && breakdown.getFactors() != null && !breakdown.getFactors().isEmpty()) {
            Table catTable = new Table(UnitValue.createPercentArray(new float[]{55, 15, 30}))
                    .useAllAvailableWidth();
            List<RiskFactorDto> sorted = new ArrayList<>(breakdown.getFactors());
            sorted.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
            for (RiskFactorDto f : sorted) {
                catTable.addCell(categoryLabelCell(f));
                catTable.addCell(categoryScoreCell(f));
                catTable.addCell(categoryBadgeCell(f));
            }
            categoriesCell.add(catTable);
        } else {
            categoriesCell.add(PdfComponents.mutedText("Category breakdown data unavailable."));
        }
        dashboard.addCell(categoriesCell);
        document.add(dashboard);

        // ── Key Findings Callout ─────────────────────────────────────────
        addKeyFindingsCallout(document, breakdown, overallLevel);

        // ── Data Quality Notice ──────────────────────────────────────────
        if (breakdown != null && breakdown.isDataIncomplete()) {
            document.add(PdfComponents.calloutBox(
                    "Data Quality Notice",
                    String.format(
                            "%d of 6 data sources were unavailable. Scores include uncertainty " +
                            "penalties and may be conservative estimates.",
                            breakdown.getUnavailableProviderCount()),
                    CalloutStyle.WARNING));
        }
    }

    // ── Category Row Helpers ─────────────────────────────────────────────

    private Cell categoryLabelCell(RiskFactorDto factor) {
        return new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(PdfDesignSystem.SPACE_XS)
                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                .add(new Paragraph(PdfDesignSystem.displayNameForCategory(factor.getCategory()))
                        .setFont(PdfDesignSystem.fontRegular())
                        .setFontSize(PdfDesignSystem.FONT_BODY_SM)
                        .setFontColor(PdfConfig.TEXT_PRIMARY)
                        .setMargin(0));
    }

    private Cell categoryScoreCell(RiskFactorDto factor) {
        return new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(PdfDesignSystem.SPACE_XS)
                .setTextAlignment(TextAlignment.RIGHT)
                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                .add(new Paragraph(String.format("%.1f", factor.getScore()))
                        .setFont(PdfDesignSystem.fontMedium())
                        .setFontSize(PdfDesignSystem.FONT_BODY_SM)
                        .setFontColor(PdfDesignSystem.NAVY_900)
                        .setMargin(0));
    }

    private Cell categoryBadgeCell(RiskFactorDto factor) {
        return new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(PdfDesignSystem.SPACE_XS)
                .setTextAlignment(TextAlignment.RIGHT)
                .setVerticalAlignment(VerticalAlignment.MIDDLE)
                .add(PdfComponents.riskBadge(factor.getLevel()));
    }

    // ── Key Findings Callout ─────────────────────────────────────────────

    private void addKeyFindingsCallout(Document document, RiskBreakdownDto breakdown, RiskLevel overallLevel) {
        if (breakdown == null || breakdown.getFactors() == null || breakdown.getFactors().isEmpty()) return;

        List<RiskFactorDto> topRisks = breakdown.getFactors().stream()
                .filter(f -> f.getScore() > 25)
                .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
                .limit(2)
                .toList();

        if (topRisks.isEmpty()) {
            document.add(PdfComponents.calloutBox(
                    "All Clear",
                    "All risk categories are within the low-risk range. Property appears to be a " +
                    "safe investment based on available data.",
                    CalloutStyle.SUCCESS));
            return;
        }

        // ── FIX: Build callout using colorCard directly (not calloutBox which returns Table) ──
        // This avoids the Table.add(Paragraph) compile error.
        // We manually construct the same visual structure as calloutBox() but with
        // our custom multi-line findings paragraph.

        CalloutStyle style = (overallLevel == RiskLevel.HIGH || overallLevel == RiskLevel.CRITICAL)
                ? CalloutStyle.DANGER : CalloutStyle.WARNING;

        // Resolve colors for chosen style
        com.itextpdf.kernel.colors.DeviceRgb bg, textColor, border;
        String icon;
        if (style == CalloutStyle.DANGER) {
            bg        = PdfDesignSystem.DANGER_BG;
            textColor = PdfDesignSystem.DANGER;
            border    = PdfConfig.HIGH_RISK_BORDER;
            icon      = "\u2716";
        } else {
            bg        = PdfDesignSystem.WARNING_BG;
            textColor = PdfDesignSystem.WARNING;
            border    = PdfConfig.MOD_RISK_BORDER;
            icon      = "\u26A0";
        }

        Cell calloutCell = PdfComponents.colorCard(bg, border, PdfDesignSystem.SPACE_MD);

        // Title row — icon + "Key Risk Findings"
        Paragraph titlePara = new Paragraph()
                .setFont(PdfDesignSystem.fontSemibold())
                .add(new Text(icon + "  ")
                        .setFont(PdfDesignSystem.fontSemibold())
                        .setFontSize(PdfDesignSystem.FONT_BODY_LG)
                        .setFontColor(textColor))
                .add(new Text("Key Risk Findings")
                        .setFont(PdfDesignSystem.fontSemibold())
                        .setFontSize(PdfDesignSystem.FONT_BODY_LG)
                        .setFontColor(textColor))
                .setMargin(0)
                .setMarginBottom(PdfDesignSystem.SPACE_XS)
                .setMultipliedLeading(PdfDesignSystem.LEADING_HEADER);
        calloutCell.add(titlePara);

        // Findings — one entry per top-risk category
        // Each entry: category name (SemiBold) + score + humanized level (Regular, muted)
        for (int i = 0; i < topRisks.size(); i++) {
            RiskFactorDto f = topRisks.get(i);

            Paragraph entry = new Paragraph()
                    .setMultipliedLeading(PdfDesignSystem.LEADING_BODY)
                    .setMarginBottom(i < topRisks.size() - 1 ? 4f : 0f);

            entry.add(new Text(PdfDesignSystem.displayNameForCategory(f.getCategory()))
                    .setFont(PdfDesignSystem.fontSemibold())
                    .setFontSize(PdfDesignSystem.FONT_BODY)
                    .setFontColor(PdfConfig.TEXT_PRIMARY));

            entry.add(new Text("  \u2014  " + String.format("%.1f", f.getScore()) + " ("
                            + HumanizeText.sentenceCaseWord(f.getLevel().name()) + ")")
                    .setFont(PdfDesignSystem.fontRegular())
                    .setFontSize(PdfDesignSystem.FONT_BODY)
                    .setFontColor(PdfConfig.TEXT_MUTED));

            calloutCell.add(entry);
        }

        document.add(PdfComponents.wrapAsBlock(calloutCell));
    }
}