// backend/src/main/java/com/realestate/duediligence/pdf/renderer/AppendixRenderer.java
package com.realestate.duediligence.pdf.renderer;

import org.springframework.stereotype.Component;

import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.realestate.duediligence.config.PdfConfig;
import com.realestate.duediligence.config.PdfDesignSystem;
import com.realestate.duediligence.dto.RiskBreakdownDto;
import com.realestate.duediligence.dto.RiskFactorDto;
import com.realestate.duediligence.pdf.util.HumanizeText;
import com.realestate.duediligence.pdf.util.PdfComponents;
import com.realestate.duediligence.service.PdfReportDataProvider.PdfReportBundle;

/**
 * Appendix — Data Sources & Methodology.
 *
 * Session 25 (final polish):
 * - FIX: Note paragraph moved INSIDE the data source card so the entire
 *   appendix renders as one atomic block. Prevents the note from
 *   orphaning to a nearly-empty final page.
 * - FIX: Note text tightened to reduce line count.
 * - Correct status derivation (Unavailable / Limited Data / Verified).
 */
@Component
public class AppendixRenderer implements SectionRenderer {

    @Override
    public void render(Document document, PdfReportBundle bundle) {
        document.add(PdfComponents.sectionHeader("Appendix")
                .setKeepWithNext(true));

        RiskBreakdownDto breakdown = bundle.breakdown;

        // ── Single atomic block: subsection + table + note ──────────────
        Cell card = PdfComponents.card(PdfDesignSystem.SPACE_MD);
        card.setKeepTogether(true); // FIX: whole appendix stays together

        card.add(PdfComponents.subsectionHeader("Data Source Integrity"));

        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 40, 20}))
                .useAllAvailableWidth()
                .setMarginTop(8f);
        table.addHeaderCell(headerCell("Category"));
        table.addHeaderCell(headerCell("Provider/Source"));
        table.addHeaderCell(headerCell("Status"));

        if (breakdown != null && breakdown.getFactors() != null) {
            for (RiskFactorDto f : breakdown.getFactors()) {
                table.addCell(dataCell(PdfDesignSystem.displayNameForCategory(f.getCategory())));

                String source = f.getDataSource();
                String humanSource = (source != null) ? HumanizeText.enumLabel(source) : "External provider";
                table.addCell(dataCell(humanSource));

                // Status logic: reflect ACTUAL availability
                String status;
                if (source == null || source.isBlank()
                    || "NO_DATA".equalsIgnoreCase(source)
                    || "No data".equalsIgnoreCase(humanSource)) {
                    status = "Unavailable";
                } else if (f.isDataUncertain()) {
                    status = "Limited Data";
                } else {
                    status = "Verified";
                }
                table.addCell(dataCell(status));
            }
        }

        card.add(table);

        // FIX: Note now lives INSIDE the card, tightened text
        // Old: verbose 2-line prose that pushed to a new page
        // New: compact single-paragraph methodology summary
        card.add(new Paragraph("Methodology: Weighted aggregation of six risk categories. Scoring bands \u2014 0-25 low, 26-50 moderate, 51-75 high, 76-100 critical.")
                .setFont(PdfDesignSystem.fontRegular())
                .setFontSize(PdfDesignSystem.FONT_CAPTION)
                .setFontColor(PdfConfig.TEXT_MUTED)
                .setItalic()
                .setMultipliedLeading(PdfDesignSystem.LEADING_BODY)
                .setMarginTop(PdfDesignSystem.SPACE_SM)
                .setMarginBottom(0));

        document.add(PdfComponents.wrapAsBlock(card));
    }

    private Cell headerCell(String t) {
        return new Cell().setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(PdfConfig.CARD_BORDER, 1f))
                .add(new Paragraph(t)
                        .setFont(PdfDesignSystem.fontSemibold())
                        .setFontSize(PdfDesignSystem.FONT_MICRO)
                        .setFontColor(PdfConfig.TEXT_MUTED));
    }

    private Cell dataCell(String t) {
        return new Cell().setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(PdfConfig.CARD_BORDER, 0.5f))
                .add(new Paragraph(t)
                        .setFont(PdfDesignSystem.fontRegular())
                        .setFontSize(PdfDesignSystem.FONT_BODY_SM)
                        .setFontColor(PdfConfig.TEXT_PRIMARY));
    }
}