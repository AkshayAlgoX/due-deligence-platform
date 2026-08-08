// backend/src/main/java/com/realestate/duediligence/pdf/renderer/RecommendationsRenderer.java
package com.realestate.duediligence.pdf.renderer;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.itextpdf.kernel.colors.DeviceRgb;
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
import com.realestate.duediligence.dto.RiskBreakdownDto;
import com.realestate.duediligence.dto.RiskFactorDto;
import com.realestate.duediligence.enums.RiskLevel;
import com.realestate.duediligence.pdf.util.HumanizeText;
import com.realestate.duediligence.pdf.util.PdfComponents;
import com.realestate.duediligence.service.PdfReportDataProvider.PdfReportBundle;

/**
 * Recommendations & Action Items.
 * 
 * Session 25 Improvements:
 * - Fixes null/empty body text handling.
 * - Humanizes prioritized narrative text.
 * - Full Inter font migration.
 */
@Component
public class RecommendationsRenderer implements SectionRenderer {

    @Override
    public void render(Document document, PdfReportBundle bundle) {
        document.add(PdfComponents.sectionHeader("Recommendations & Action Items"));

        RiskBreakdownDto breakdown = bundle.breakdown;

        document.add(new Paragraph("The following prioritized action items are recommended to mitigate identified risks. Address higher-priority items before proceeding with transaction.")
                .setFont(PdfDesignSystem.fontRegular())
                .setFontSize(PdfDesignSystem.FONT_BODY)
                .setFontColor(PdfConfig.TEXT_MUTED)
                .setMultipliedLeading(PdfDesignSystem.LEADING_BODY)
                .setMarginBottom(PdfDesignSystem.SPACE_MD));

        if (breakdown != null && breakdown.getFactors() != null) {
            List<RiskFactorDto> sorted = new ArrayList<>(breakdown.getFactors());
            sorted.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));

            int itemNum = 1;
            for (RiskFactorDto factor : sorted) {
                // If recommendation is missing, provide category-specific fallback narrative
                String recText = (factor.getRecommendation() != null && !factor.getRecommendation().isBlank())
                        ? HumanizeText.cleanNarrative(factor.getRecommendation())
                        : "Perform standard verification for " + PdfDesignSystem.displayNameForCategory(factor.getCategory()) + ".";
                
                document.add(buildRecommendationCard(itemNum++, factor, recText));
            }
        } else {
            document.add(PdfComponents.mutedText("No specific recommendations available due to missing risk data."));
        }

        renderGeneralGuidance(document);
    }

    private Table buildRecommendationCard(int number, RiskFactorDto factor, String text) {
        Cell card = PdfComponents.card(PdfDesignSystem.SPACE_MD);

        Table header = new Table(UnitValue.createPercentArray(new float[]{8, 62, 30})).useAllAvailableWidth().setMarginBottom(PdfDesignSystem.SPACE_SM);

        // Number Badge
        header.addCell(new Cell().setBorder(Border.NO_BORDER).setVerticalAlignment(VerticalAlignment.MIDDLE)
                .add(new Paragraph(String.valueOf(number))
                        .setFont(PdfDesignSystem.fontBold()).setFontSize(PdfDesignSystem.FONT_H2)
                        .setFontColor(PdfDesignSystem.colorForLevel(factor.getLevel()))));

        // Category
        header.addCell(new Cell().setBorder(Border.NO_BORDER).setVerticalAlignment(VerticalAlignment.MIDDLE)
                .add(new Paragraph(PdfDesignSystem.displayNameForCategory(factor.getCategory()))
                        .setFont(PdfDesignSystem.fontSemibold()).setFontSize(PdfDesignSystem.FONT_H3).setFontColor(PdfDesignSystem.NAVY_900)));

        // Priority Badge
        header.addCell(new Cell().setBorder(Border.NO_BORDER).setTextAlignment(TextAlignment.RIGHT).setVerticalAlignment(VerticalAlignment.MIDDLE)
                .add(priorityBadge(factor.getLevel())));

        card.add(header);
        card.add(new Paragraph(text)
                .setFont(PdfDesignSystem.fontRegular()).setFontSize(PdfDesignSystem.FONT_BODY)
                .setFontColor(PdfConfig.TEXT_PRIMARY).setMultipliedLeading(PdfDesignSystem.LEADING_BODY));

        return PdfComponents.wrapAsBlock(card);
    }

    private Table priorityBadge(RiskLevel level) {
        String label = (level == RiskLevel.HIGH || level == RiskLevel.CRITICAL) ? "HIGH PRIORITY" : 
                       (level == RiskLevel.MEDIUM) ? "MEDIUM" : "STANDARD";
        
        return PdfComponents.tagBadge(label, 
                PdfDesignSystem.bgForLevel(level), 
                PdfDesignSystem.colorForLevel(level), 
                PdfDesignSystem.borderForLevel(level));
    }

    private void renderGeneralGuidance(Document document) {
        Cell card = PdfComponents.card(PdfDesignSystem.SPACE_MD);
        card.add(PdfComponents.subsectionHeader("General Due Diligence Checklist"));
        
        String[] items = {
                "Engage a qualified property lawyer for legal review",
                "Obtain an official encumbrance certificate from Sub-Registrar office",
                "Verify property tax clearance with local municipal body",
                "Conduct a physical inspection with a certified surveyor"
        };

        for (String item : items) {
            Paragraph line = new Paragraph().setMarginBottom(4f);
            line.add(new Text("✓  ").setFont(PdfDesignSystem.fontBold()).setFontColor(PdfConfig.BRAND_EMERALD));
            line.add(new Text(item).setFont(PdfDesignSystem.fontRegular()).setFontSize(PdfDesignSystem.FONT_BODY_SM).setFontColor(PdfConfig.TEXT_PRIMARY));
            card.add(line);
        }
        document.add(PdfComponents.wrapAsBlock(card));
    }
}