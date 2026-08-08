// backend/src/main/java/com/realestate/duediligence/pdf/renderer/PropertyOverviewRenderer.java
package com.realestate.duediligence.pdf.renderer;

import org.springframework.stereotype.Component;

import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.realestate.duediligence.config.PdfConfig;
import com.realestate.duediligence.config.PdfDesignSystem;
import com.realestate.duediligence.dto.PropertyResponse;
import com.realestate.duediligence.pdf.util.IndianNumberFormatter;
import com.realestate.duediligence.pdf.util.PdfComponents;
import com.realestate.duediligence.service.PdfReportDataProvider.PdfReportBundle;

/**
 * Property Overview — Facts & Figures.
 *
 * Session 25 (final):
 * - Removed aggressive .setKeepTogether() that stranded card on isolated page
 * - Added ASCII sanitization for text fields (fixes glyph-missing gibberish)
 * - Fallback to "Not specified" for null/blank values
 */
@Component
public class PropertyOverviewRenderer implements SectionRenderer {

    @Override
    public void render(Document document, PdfReportBundle bundle) {
        // FIX B: setKeepWithNext keeps header bonded to first content
        // but allows the card body to flow naturally across pages if needed.
        document.add(PdfComponents.sectionHeader("Property Overview")
                .setKeepWithNext(true));

        PropertyResponse property = extractProperty(bundle);
        if (property == null) {
            document.add(PdfComponents.mutedText("Property data unavailable."));
            return;
        }

        boolean isCommercial = property.getPropertyType() != null
                && property.getPropertyType().toUpperCase().contains("COMMERCIAL");

        // FIX B: Removed .setKeepTogether(true) — was forcing card to next page
        // and leaving huge whitespace on previous page. Card can now flow naturally.
        Cell card = PdfComponents.card();

        Table columns = new Table(UnitValue.createPercentArray(new float[]{50, 50})).useAllAvailableWidth();

        // LEFT COLUMN
        Cell left = new Cell().setBorder(Border.NO_BORDER).setPaddingRight(PdfDesignSystem.SPACE_MD);

        left.add(subsectionMini("Location"));
        Table locTable = PdfComponents.dataTable();
        PdfComponents.addDataRow(locTable, "Address",  safeText(property.getAddress()));
        PdfComponents.addDataRow(locTable, "City",     safeText(property.getCity()));
        PdfComponents.addDataRow(locTable, "State",    safeText(property.getState()));
        PdfComponents.addDataRow(locTable, "ZIP Code", safeText(property.getZipCode()));
        left.add(locTable);

        left.add(subsectionMini("Classification").setMarginTop(PdfDesignSystem.SPACE_MD));
        Table classTable = PdfComponents.dataTable();
        PdfComponents.addDataRow(classTable, "Type",      fallback(property.getPropertyType()));
        PdfComponents.addDataRow(classTable, "Zoning",    fallback(property.getZoning()));
        PdfComponents.addDataRow(classTable, "Condition", fallback(property.getCondition()));
        PdfComponents.addDataRow(classTable, "Verified",  Boolean.TRUE.equals(property.getVerified()) ? "Yes \u2713" : "No");
        left.add(classTable);
        columns.addCell(left);

        // RIGHT COLUMN
        Cell right = new Cell().setBorder(Border.NO_BORDER).setPaddingLeft(PdfDesignSystem.SPACE_MD);

        right.add(subsectionMini("Physical Attributes"));
        Table physTable = PdfComponents.dataTable();
        PdfComponents.addDataRow(physTable, "Area",       property.getArea() != null ? IndianNumberFormatter.formatArea(property.getArea()) : "Not specified");
        PdfComponents.addDataRow(physTable, "Year Built", property.getYearBuilt() != null ? String.valueOf(property.getYearBuilt()) : "Not specified");
        PdfComponents.addDataRow(physTable, "Structure",  fallback(property.getStructureType()));
        if (!isCommercial) {
            PdfComponents.addDataRow(physTable, "Bedrooms", property.getBedrooms() != null ? String.valueOf(property.getBedrooms()) : "Not specified");
        }
        right.add(physTable);

        right.add(subsectionMini("Financial Valuation").setMarginTop(PdfDesignSystem.SPACE_MD));
        Table valTable = PdfComponents.dataTable();
        if (property.getMarketValue() != null) {
            PdfComponents.addDataRow(valTable, "Market Value", IndianNumberFormatter.formatCurrency(property.getMarketValue()));
            if (property.getArea() != null && property.getArea() > 0) {
                long ppsf = (long) (property.getMarketValue() / property.getArea());
                PdfComponents.addDataRow(valTable, "Price / sq ft", IndianNumberFormatter.formatPricePerSqft(ppsf));
            }
        } else {
            PdfComponents.addDataRow(valTable, "Market Value", "Not specified");
        }
        right.add(valTable);
        columns.addCell(right);

        card.add(columns);
        document.add(PdfComponents.wrapAsBlock(card));
    }

    private com.itextpdf.layout.element.Paragraph subsectionMini(String text) {
        return new com.itextpdf.layout.element.Paragraph(text.toUpperCase())
                .setFont(PdfDesignSystem.fontSemibold())
                .setFontSize(PdfDesignSystem.FONT_MICRO)
                .setFontColor(PdfConfig.BRAND_EMERALD)
                .setCharacterSpacing(1.2f)
                .setMarginBottom(PdfDesignSystem.SPACE_XS);
    }

    /**
     * FIX A: Sanitize text to prevent glyph-missing gibberish.
     *
     * Inter's default glyph set covers Latin + Latin-Extended + Cyrillic +
     * Greek. Indic scripts (Kannada, Telugu, Devanagari) will render as
     * .notdef box glyphs or barcode-like squares.
     *
     * Strategy: if text contains characters outside Basic Latin extended,
     * fall back to "Not specified" rather than showing broken glyphs.
     * A future enhancement could load a Noto Sans Indic font conditionally.
     */
    private String safeText(String s) {
        if (s == null || s.isBlank()) return "Not specified";
        String trimmed = s.trim();
        // Allow ASCII + Latin-1 Supplement + Latin Extended-A + Latin Extended-B + punctuation
        // Reject if ANY character is outside U+0000..U+024F range
        for (int i = 0; i < trimmed.length(); i++) {
            int cp = trimmed.codePointAt(i);
            if (cp > 0x024F && cp != 0x2013 && cp != 0x2014 && cp != 0x00A0 && cp != 0x20B9) {
                // Contains non-Latin glyph — likely Indic/CJK. Skip to avoid broken render.
                return "Not specified";
            }
        }
        return trimmed;
    }

    private String fallback(String val) {
        if (val == null || val.isBlank() || val.equals("—") || val.equals("-")) return "Not specified";
        return safeText(val);
    }

    private PropertyResponse extractProperty(PdfReportBundle bundle) {
        return (bundle.aggregated != null) ? bundle.aggregated.getProperty() : null;
    }
}