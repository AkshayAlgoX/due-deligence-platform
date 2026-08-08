// backend/src/main/java/com/realestate/duediligence/pdf/renderer/RiskAnalysisRenderer.java
package com.realestate.duediligence.pdf.renderer;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
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
import com.realestate.duediligence.dto.RiskBreakdownDto;
import com.realestate.duediligence.dto.RiskFactorDto;
import com.realestate.duediligence.pdf.util.HumanizeText;
import com.realestate.duediligence.pdf.util.PdfComponents;
import com.realestate.duediligence.service.ChartGenerator;
import com.realestate.duediligence.service.ChartGenerator.CategoryScore;
import com.realestate.duediligence.service.PdfReportDataProvider.PdfReportBundle;

/**
 * Risk Analysis — Deep Dive.
 *
 * Session 25 (final):
 * - FIX C: Header row now uses setKeepTogether so title never orphans on split
 * - FIX D: Word-boundary truncation for strategy preview (no more "purc...")
 * - FIX: Section header setKeepWithNext prevents orphaned header
 */
@Component
public class RiskAnalysisRenderer implements SectionRenderer {

    @Autowired
    private ChartGenerator chartGenerator;

    @Override
    public void render(Document document, PdfReportBundle bundle) {
        document.add(PdfComponents.sectionHeader("Risk Analysis & Breakdown")
                .setKeepWithNext(true));

        RiskBreakdownDto breakdown = bundle.breakdown;
        if (breakdown == null || breakdown.getFactors() == null || breakdown.getFactors().isEmpty()) {
            document.add(PdfComponents.mutedText("Risk breakdown data unavailable."));
            return;
        }

        List<RiskFactorDto> sorted = new ArrayList<>(breakdown.getFactors());
        sorted.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

        // ── Bar Chart ────────────────────────────────────────────────────
        try {
            List<CategoryScore> chartData = sorted.stream()
                    .map(f -> new CategoryScore(f.getCategory(), f.getScore()))
                    .toList();

            byte[] barPng = chartGenerator.renderCategoryBarChart(chartData);
            if (barPng != null && barPng.length > 100) {
                Image chart = new Image(ImageDataFactory.create(barPng));
                chart.setWidth(UnitValue.createPercentValue(95));
                chart.setHorizontalAlignment(HorizontalAlignment.CENTER);
                chart.setMarginBottom(PdfDesignSystem.SPACE_LG);
                document.add(chart);
            }
        } catch (Exception ignored) {}

        // ── Category Cards ───────────────────────────────────────────────
        for (RiskFactorDto factor : sorted) {
            document.add(buildCategoryCard(factor));
        }
    }

    private Table buildCategoryCard(RiskFactorDto factor) {
        Cell card = PdfComponents.card(PdfDesignSystem.SPACE_MD);

        // ── Header row — MUST stay together (FIX C) ─────────────────────
        // If the card splits mid-render, the header (title + score + badge)
        // must stay bonded so users never see a headerless card.
        Table header = new Table(UnitValue.createPercentArray(new float[]{60, 20, 20}))
                .useAllAvailableWidth()
                .setMarginBottom(PdfDesignSystem.SPACE_SM)
                .setKeepTogether(true); // FIX C: Prevents header split

        header.addCell(new Cell().setBorder(Border.NO_BORDER).setVerticalAlignment(VerticalAlignment.MIDDLE)
                .add(new Paragraph(PdfDesignSystem.displayNameForCategory(factor.getCategory()))
                        .setFont(PdfDesignSystem.fontSemibold())
                        .setFontSize(PdfDesignSystem.FONT_H3)
                        .setFontColor(PdfDesignSystem.NAVY_900)
                        .setMargin(0)));

        header.addCell(new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT).setVerticalAlignment(VerticalAlignment.MIDDLE)
                .add(new Paragraph(String.format("%.1f", factor.getScore()))
                        .setFont(PdfDesignSystem.fontBold())
                        .setFontSize(PdfDesignSystem.FONT_H3)
                        .setFontColor(PdfDesignSystem.NAVY_900)
                        .setMargin(0)));

        header.addCell(new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT).setVerticalAlignment(VerticalAlignment.MIDDLE)
                .add(PdfComponents.riskBadge(factor.getLevel())));

        card.add(header);

        // ── Data Source ─────────────────────────────────────────────────
        if (factor.getDataSource() != null) {
            Paragraph source = new Paragraph().setMarginBottom(PdfDesignSystem.SPACE_SM);
            source.add(new Text("DATA SOURCE: ")
                    .setFont(PdfDesignSystem.fontSemibold())
                    .setFontSize(PdfDesignSystem.FONT_MICRO)
                    .setFontColor(PdfConfig.TEXT_MUTED)
                    .setCharacterSpacing(1.2f));
            source.add(new Text(HumanizeText.enumLabel(factor.getDataSource()))
                    .setFont(PdfDesignSystem.fontMedium())
                    .setFontSize(PdfDesignSystem.FONT_BODY_SM)
                    .setFontColor(factor.isDataUncertain() ? PdfDesignSystem.WARNING : PdfConfig.BRAND_EMERALD));
            card.add(source);
        }

        // ── Analysis Narrative ──────────────────────────────────────────
        if (factor.getExplanation() != null && !factor.getExplanation().isBlank()) {
            card.add(PdfComponents.labelText("ANALYSIS"));
            card.add(new Paragraph(HumanizeText.cleanNarrative(factor.getExplanation()))
                    .setFont(PdfDesignSystem.fontRegular())
                    .setFontSize(PdfDesignSystem.FONT_BODY_SM)
                    .setFontColor(PdfConfig.TEXT_PRIMARY)
                    .setMultipliedLeading(PdfDesignSystem.LEADING_BODY)
                    .setMarginBottom(PdfDesignSystem.SPACE_SM));
        }

        // ── Strategy Preview ────────────────────────────────────────────
        if (factor.getRecommendation() != null && !factor.getRecommendation().isBlank()) {
            Cell callout = PdfComponents.colorCard(
                    PdfDesignSystem.SUCCESS_BG,
                    PdfConfig.BRAND_EMERALD,
                    PdfDesignSystem.SPACE_SM);

            String cleaned = HumanizeText.cleanNarrative(factor.getRecommendation());
            String preview = truncateAtWord(cleaned, 90); // FIX D
            boolean truncated = preview.length() < cleaned.length();

            Paragraph rec = new Paragraph()
                    .setMultipliedLeading(PdfDesignSystem.LEADING_BODY)
                    .add(new Text("STRATEGY: ")
                            .setFont(PdfDesignSystem.fontBold())
                            .setFontSize(PdfDesignSystem.FONT_MICRO)
                            .setFontColor(PdfConfig.BRAND_EMERALD))
                    .add(new Text(preview)
                            .setFont(PdfDesignSystem.fontMedium())
                            .setFontSize(PdfDesignSystem.FONT_BODY_SM)
                            .setFontColor(PdfConfig.TEXT_PRIMARY));

            if (truncated) {
                rec.add(new Text(" See full action plan below.")
                        .setFont(PdfDesignSystem.fontRegular())
                        .setFontSize(8f)
                        .setFontColor(PdfConfig.TEXT_MUTED)
                        .setItalic());
            }

            callout.add(rec);
            card.add(PdfComponents.wrapAsBlock(callout).setMarginBottom(0));
        }

        return PdfComponents.wrapAsBlock(card);
    }

    /**
     * FIX D: Word-boundary truncation.
     *
     * The old {@code text.substring(0, limit)} approach cut through words
     * mid-syllable, producing "purc..." and other broken previews. This
     * variant walks back to the last space before {@code limit} and
     * trims cleanly, appending "…" only if truncation actually happened.
     *
     * If the string is already within the limit, returns unchanged.
     * If no space exists before the limit, falls back to hard cut.
     */
    private String truncateAtWord(String text, int limit) {
        if (text == null || text.length() <= limit) return text == null ? "" : text;

        // Walk back from limit to find last whitespace
        int cut = limit;
        while (cut > 0 && !Character.isWhitespace(text.charAt(cut))) {
            cut--;
        }
        if (cut == 0) {
            // No whitespace found — fall back to hard cut
            cut = limit;
        }
        return text.substring(0, cut).trim() + "\u2026";
    }
}