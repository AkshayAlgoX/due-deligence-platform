
package com.realestate.duediligence.pdf.renderer;

import java.util.List;

import org.springframework.stereotype.Component;

import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.realestate.duediligence.aggregation.AggregatedPropertyResponse;
import com.realestate.duediligence.config.PdfConfig;
import com.realestate.duediligence.config.PdfDesignSystem;
import com.realestate.duediligence.dto.PropertyResponse;
import com.realestate.duediligence.integration.common.IntegrationResponse;
import com.realestate.duediligence.integration.tax.TaxRecord;
import com.realestate.duediligence.pdf.util.IndianNumberFormatter;
import com.realestate.duediligence.pdf.util.PdfComponents;
import com.realestate.duediligence.service.PdfReportDataProvider.PdfReportBundle;

/**
 * Financial Analysis — Valuation & Taxes.
 *
 * Session 25 (final):
 * - FIX E: Section header keepsWithNext so it never orphans from metric cards
 */
@Component
public class FinancialAnalysisRenderer implements SectionRenderer {

    @Override
    public void render(Document document, PdfReportBundle bundle) {
        // FIX E: setKeepWithNext prevents section header from being alone at page bottom
        document.add(PdfComponents.sectionHeader("Financial Analysis")
                .setKeepWithNext(true));

        PropertyResponse property = bundle.aggregated != null ? bundle.aggregated.getProperty() : null;

        if (property != null && property.getMarketValue() != null) {
            Table metrics = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .useAllAvailableWidth()
                    .setMarginBottom(PdfDesignSystem.SPACE_MD)
                    .setKeepTogether(true); // metric pair should never split

            metrics.addCell(PdfComponents.metricCard(
                    IndianNumberFormatter.formatCurrencyCompact(property.getMarketValue()),
                    "Est. Market Value", PdfConfig.BRAND_EMERALD));

            if (property.getArea() != null && property.getArea() > 0) {
                long ppsf = (long) (property.getMarketValue() / property.getArea());
                metrics.addCell(PdfComponents.metricCard(
                        IndianNumberFormatter.formatPricePerSqft(ppsf),
                        "Price Per Sq Ft", PdfDesignSystem.NAVY_900));
            } else {
                metrics.addCell(PdfComponents.metricCard(
                        "\u2014",
                        "Price Per Sq Ft", PdfConfig.TEXT_MUTED));
            }
            document.add(metrics);
        }

        renderTaxHistory(document, bundle.aggregated);
        renderOwnershipSummary(document, bundle.aggregated);
    }

    private void renderTaxHistory(Document document, AggregatedPropertyResponse agg) {
        if (agg == null) return;
        IntegrationResponse<List<TaxRecord>> taxResp = agg.getTaxHistory();

        Cell card = PdfComponents.card();
        card.add(PdfComponents.subsectionHeader("Municipal Tax Records"));

        if (taxResp == null || taxResp.getData() == null || taxResp.getData().isEmpty()) {
            card.add(PdfComponents.mutedText("No municipal tax records found for this property location."));
        } else {
            Table table = new Table(UnitValue.createPercentArray(new float[]{20, 30, 30, 20}))
                    .useAllAvailableWidth().setMarginTop(8f);
            table.addHeaderCell(header("Year"));
            table.addHeaderCell(header("Assessed Value"));
            table.addHeaderCell(header("Tax Amount"));
            table.addHeaderCell(header("Status"));

            for (TaxRecord rec : taxResp.getData()) {
                table.addCell(data(rec.getAssessmentYear() != null ? rec.getAssessmentYear().toString() : "—"));
                table.addCell(data(rec.getAssessedValue() != null ? IndianNumberFormatter.formatCurrency(rec.getAssessedValue()) : "—"));
                table.addCell(data(rec.getTaxAmount() != null ? IndianNumberFormatter.formatCurrency(rec.getTaxAmount()) : "—"));
                table.addCell(data(rec.getStatus() != null ? rec.getStatus() : "—"));
            }
            card.add(table);
        }
        document.add(PdfComponents.wrapAsBlock(card));
    }

    private void renderOwnershipSummary(Document document, AggregatedPropertyResponse agg) {
        Cell card = PdfComponents.card();
        card.add(PdfComponents.subsectionHeader("Financial Verification Status"));

        String msg = (agg != null && agg.getOwnership() != null && agg.getOwnership().getData() != null)
            ? "Financial standing verified against title records."
            : "Ownership records unavailable \u2014 financial verification incomplete.";

        card.add(new Paragraph(msg)
                .setFont(PdfDesignSystem.fontRegular())
                .setFontSize(PdfDesignSystem.FONT_BODY_SM)
                .setFontColor(PdfConfig.TEXT_MUTED)
                .setItalic());

        document.add(PdfComponents.wrapAsBlock(card));
    }

    private Cell header(String t) {
        return new Cell().setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(PdfConfig.CARD_BORDER, 1f))
                .add(new Paragraph(t.toUpperCase())
                        .setFont(PdfDesignSystem.fontSemibold())
                        .setFontSize(PdfDesignSystem.FONT_MICRO)
                        .setFontColor(PdfConfig.TEXT_MUTED));
    }

    private Cell data(String t) {
        return new Cell().setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(PdfConfig.CARD_BORDER, 0.5f))
                .add(new Paragraph(t)
                        .setFont(PdfDesignSystem.fontRegular())
                        .setFontSize(PdfDesignSystem.FONT_BODY_SM)
                        .setFontColor(PdfConfig.TEXT_PRIMARY));
    }
}