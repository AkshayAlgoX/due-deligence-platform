// backend/src/main/java/com/realestate/duediligence/pdf/util/PdfComponents.java
package com.realestate.duediligence.pdf.util;

import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.element.Text;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import com.itextpdf.layout.renderer.CellRenderer;
import com.itextpdf.layout.renderer.DrawContext;
import com.realestate.duediligence.config.PdfConfig;
import com.realestate.duediligence.config.PdfDesignSystem;
import com.realestate.duediligence.enums.RiskLevel;

/**
 * Reusable PDF UI components — the building blocks of every renderer.
 *
 * <p>As of Session 25 (Message 2), ALL text primitives use the Inter font
 * family loaded by {@link PdfFontManager}. The key rules:
 * <ul>
 *   <li>NO {@code .setBold()} anywhere — always {@code .setFont(PdfDesignSystem.fontSemibold())}
 *       or {@code .setFont(PdfDesignSystem.fontBold())}</li>
 *   <li>Every {@link Paragraph} and {@link Text} element has an explicit
 *       {@code .setFont()} call — no Helvetica leakage allowed</li>
 *   <li>Body paragraphs use {@link PdfDesignSystem#LEADING_BODY} (1.45×) for
 *       comfortable reading rhythm</li>
 *   <li>Headers use {@link PdfDesignSystem#LEADING_HEADER} (1.15×) for
 *       tight, display-appropriate spacing</li>
 *   <li>Eyebrow/label elements use {@link PdfDesignSystem#TRACKING_EYEBROW}
 *       character spacing for premium uppercase feel</li>
 * </ul>
 *
 * <p>Component catalog:
 * <ul>
 *   <li>{@link #riskBadge(RiskLevel)} — colored pill for risk levels</li>
 *   <li>{@link #tagBadge(String, DeviceRgb, DeviceRgb)} — generic pill</li>
 *   <li>{@link #sectionHeader(String)} — H1 with green accent underline</li>
 *   <li>{@link #subsectionHeader(String)} — H2 for cards</li>
 *   <li>{@link #card(float)} — rounded container cell</li>
 *   <li>{@link #calloutBox(String, String, CalloutStyle)} — info/warn/success/danger</li>
 *   <li>{@link #dataTable()} — 2-col data table</li>
 *   <li>{@link #metricCard(String, String, DeviceRgb)} — big number + label</li>
 *   <li>{@link #horizontalDivider()} — thin gray line</li>
 * </ul>
 */
public final class PdfComponents {

    private PdfComponents() { /* utility */ }

    // ═══════════════════════════════════════════════════════════════
    // RISK LEVEL BADGE (semantic — auto colored)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Colored pill badge for a risk level.
     * Example rendering: [ LOW RISK ] in green, [ HIGH RISK ] in red.
     *
     * <p>Uses Inter Bold for the label text — maximum legibility at small sizes.
     */
    public static Table riskBadge(RiskLevel level) {
        return tagBadge(
                PdfDesignSystem.labelForLevel(level),
                PdfDesignSystem.bgForLevel(level),
                PdfDesignSystem.colorForLevel(level),
                PdfDesignSystem.borderForLevel(level)
        );
    }

    // ═══════════════════════════════════════════════════════════════
    // GENERIC TAG/PILL BADGE
    // ═══════════════════════════════════════════════════════════════

    /**
     * Rounded pill badge with custom colors (border defaults to bg color).
     */
    public static Table tagBadge(String text, DeviceRgb bg, DeviceRgb textColor) {
        return tagBadge(text, bg, textColor, bg);
    }

    /**
     * Rounded pill badge with explicit border color.
     *
     * <p>Font: Inter Bold — badges are micro-typography that needs maximum weight
     * to be legible at FONT_CAPTION (8pt) size.
     *
     * <p>Width: calculated to hug content — avoids the pill stretching across
     * the full parent cell which caused left-alignment artifacts in Session 22.
     *
     * <p>The {@link RoundedRenderer} handles drawing — see its Javadoc for the
     * corner-radius clamp that prevents the "hourglass" artifact (fixed Session 23).
     */
    public static Table tagBadge(String text, DeviceRgb bg, DeviceRgb textColor, DeviceRgb border) {
        // Non-breaking space keeps multi-word labels on one line in narrow cells
        String singleLineText = text == null ? "" : text.replace(' ', '\u00A0');

        // Approximate text width so the pill hugs its content.
        // Inter Bold caption ≈ 5pt per char + 2 * SPACE_MD padding + 6pt buffer.
        float approxTextWidth = singleLineText.length() * 5.2f;
        float pillWidth = approxTextWidth + (2 * PdfDesignSystem.SPACE_MD) + 8f;

        Table pill = new Table(1);
        pill.setWidth(pillWidth);
        pill.setHorizontalAlignment(HorizontalAlignment.CENTER);
        pill.setMarginLeft(3f);
        pill.setMarginRight(3f);

        // ── Pill label text ──────────────────────────────────────────────
        // Rule: Inter Bold for badge text (max weight at small sizes)
        // Rule: NO .setBold() — explicit .setFont() only
        Text labelText = new Text(singleLineText)
                .setFont(PdfDesignSystem.fontBold())
                .setFontSize(PdfDesignSystem.FONT_CAPTION)
                .setFontColor(textColor);

        Paragraph label = new Paragraph()
                .add(labelText)
                .setFont(PdfDesignSystem.fontBold())        // paragraph-level fallback
                .setFontSize(PdfDesignSystem.FONT_CAPTION)
                .setFontColor(textColor)
                .setMargin(0)
                .setTextAlignment(TextAlignment.CENTER)
                // No leading needed — single-line pill
                .setMultipliedLeading(1f);

        Cell cell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setPaddingLeft(PdfDesignSystem.SPACE_MD)
                .setPaddingRight(PdfDesignSystem.SPACE_MD)
                .setPaddingTop(2f)
                .setPaddingBottom(2f)
                .setTextAlignment(TextAlignment.CENTER)
                .setKeepTogether(true)
                .add(label);

        cell.setNextRenderer(new RoundedRenderer(cell, 8f, bg, border, 0.8f));
        pill.addCell(cell);
        return pill;
    }

    // ═══════════════════════════════════════════════════════════════
    // SECTION HEADER (H1 with green accent bar)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Large section header with brand-green accent underline.
     * Use for top-of-page section titles: "RISK ANALYSIS", "FINANCIAL", etc.
     *
     * <p>Font: Inter Bold — maximum emphasis for H1.
     * Leading: LEADING_HEADER (1.15×) — tight for display text.
     * Tracking: TRACKING_HEADER (0.5f) — slight spacing for uppercase readability.
     */
    public static Paragraph sectionHeader(String title) {
        return new Paragraph(title.toUpperCase())
                .setFont(PdfDesignSystem.fontBold())
                .setFontSize(PdfDesignSystem.FONT_H2)
                .setFontColor(PdfDesignSystem.NAVY_900)
                .setMultipliedLeading(PdfDesignSystem.LEADING_HEADER)
                .setCharacterSpacing(PdfDesignSystem.TRACKING_HEADER)
                .setMarginTop(PdfDesignSystem.SPACE_LG)
                .setMarginBottom(PdfDesignSystem.SPACE_SM)
                .setBorderBottom(new SolidBorder(PdfConfig.BRAND_EMERALD, 2f))
                .setPaddingBottom(PdfDesignSystem.SPACE_XS);
    }

    /**
     * Sub-section header inside a card. Smaller, no underline.
     *
     * <p>Font: Inter SemiBold — premium emphasis without full Bold noise.
     * Leading: LEADING_HEADER (1.15×).
     */
    public static Paragraph subsectionHeader(String title) {
        return new Paragraph(title)
                .setFont(PdfDesignSystem.fontSemibold())
                .setFontSize(PdfDesignSystem.FONT_H3)
                .setFontColor(PdfDesignSystem.NAVY_900)
                .setMultipliedLeading(PdfDesignSystem.LEADING_HEADER)
                .setMarginTop(PdfDesignSystem.SPACE_SM)
                .setMarginBottom(PdfDesignSystem.SPACE_XS);
    }

    /**
     * Small uppercase label used for form-like key labels.
     * Example: "REPORT ID", "GENERATED ON".
     *
     * <p>Font: Inter SemiBold — legible at FONT_MICRO (7pt).
     * Tracking: TRACKING_EYEBROW (1.5f) — premium uppercase feel.
     */
    public static Paragraph labelText(String text) {
        return new Paragraph(text.toUpperCase())
                .setFont(PdfDesignSystem.fontSemibold())
                .setFontSize(PdfDesignSystem.FONT_MICRO)
                .setFontColor(PdfConfig.TEXT_MUTED)
                .setCharacterSpacing(PdfDesignSystem.TRACKING_EYEBROW)
                .setMultipliedLeading(PdfDesignSystem.LEADING_HEADER)
                .setMargin(0);
    }

    /**
     * Standard body text paragraph.
     *
     * <p>Font: Inter Regular — the default for all prose.
     * Leading: LEADING_BODY (1.45×) — comfortable reading rhythm.
     */
    public static Paragraph bodyText(String text) {
        return new Paragraph(text != null ? text : "")
                .setFont(PdfDesignSystem.fontRegular())
                .setFontSize(PdfDesignSystem.FONT_BODY)
                .setFontColor(PdfConfig.TEXT_PRIMARY)
                .setMultipliedLeading(PdfDesignSystem.LEADING_BODY)
                .setMargin(0);
    }

    /**
     * Muted secondary text — captions, footnotes, helper text.
     *
     * <p>Font: Inter Regular — consistent with body, smaller/muted.
     * Leading: LEADING_BODY (1.45×).
     */
    public static Paragraph mutedText(String text) {
        return new Paragraph(text != null ? text : "")
                .setFont(PdfDesignSystem.fontRegular())
                .setFontSize(PdfDesignSystem.FONT_BODY_SM)
                .setFontColor(PdfConfig.TEXT_MUTED)
                .setMultipliedLeading(PdfDesignSystem.LEADING_BODY)
                .setMargin(0);
    }

    // ═══════════════════════════════════════════════════════════════
    // CARD CONTAINER
    // ═══════════════════════════════════════════════════════════════

    /**
     * Creates a full-width rounded card with default padding.
     * Add content by calling {@code cell.add(...)}.
     *
     * @return a Cell ready to have content added
     */
    public static Cell card() {
        return card(PdfDesignSystem.SPACE_MD);
    }

    /**
     * Card with custom padding.
     */
    public static Cell card(float padding) {
        Cell cell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(padding);
        cell.setNextRenderer(new RoundedRenderer(
                cell,
                PdfDesignSystem.RADIUS_MD,
                PdfConfig.CARD_BG,
                PdfConfig.CARD_BORDER,
                1f
        ));
        return cell;
    }

    /**
     * Card with custom background/border — used for callouts and colored cards.
     */
    public static Cell colorCard(DeviceRgb bg, DeviceRgb border, float padding) {
        Cell cell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(padding);
        cell.setNextRenderer(new RoundedRenderer(
                cell,
                PdfDesignSystem.RADIUS_MD,
                bg,
                border,
                1f
        ));
        return cell;
    }

    /**
     * Wraps a Cell as a single-row full-width Table (needed to place a card
     * as a block-level element in the document flow).
     */
    public static Table wrapAsBlock(Cell cell) {
        Table wrapper = new Table(UnitValue.createPercentArray(new float[]{100}))
                .useAllAvailableWidth()
                .setMarginBottom(PdfDesignSystem.SPACE_MD);
        wrapper.addCell(cell);
        return wrapper;
    }

    // ═══════════════════════════════════════════════════════════════
    // CALLOUT BOX (info / warning / success / danger)
    // ═══════════════════════════════════════════════════════════════

    public enum CalloutStyle {
        INFO, SUCCESS, WARNING, DANGER
    }

    /**
     * Callout box with icon, title, and body — for highlighted findings.
     *
     * <p>Title font: Inter SemiBold — assertive without being heavy.
     * Body font: Inter Regular — body copy default.
     * Leading: LEADING_BODY on body, LEADING_HEADER on title.
     */
    public static Table calloutBox(String title, String body, CalloutStyle style) {
        DeviceRgb bg, textColor, border;
        String icon;

        switch (style) {
            case SUCCESS:
                bg = PdfDesignSystem.SUCCESS_BG;
                textColor = PdfDesignSystem.SUCCESS;
                border = PdfConfig.LOW_RISK_BORDER;
                icon = "\u2713";   // ✓
                break;
            case WARNING:
                bg = PdfDesignSystem.WARNING_BG;
                textColor = PdfDesignSystem.WARNING;
                border = PdfConfig.MOD_RISK_BORDER;
                icon = "\u26A0";   // ⚠
                break;
            case DANGER:
                bg = PdfDesignSystem.DANGER_BG;
                textColor = PdfDesignSystem.DANGER;
                border = PdfConfig.HIGH_RISK_BORDER;
                icon = "\u2716";   // ✖
                break;
            case INFO:
            default:
                bg = PdfDesignSystem.INFO_BG;
                textColor = PdfDesignSystem.INFO;
                border = new DeviceRgb(186, 230, 253);
                icon = "\u2139";   // ℹ
                break;
        }

        Cell content = colorCard(bg, border, PdfDesignSystem.SPACE_MD);

        // ── Title row: icon + bold title ─────────────────────────────────
        // Font: Inter SemiBold for callout titles
        // Rule: Text elements ALSO need explicit .setFont() — not just Paragraph
        Text iconText = new Text(icon + "  ")
                .setFont(PdfDesignSystem.fontSemibold())
                .setFontSize(PdfDesignSystem.FONT_BODY_LG)
                .setFontColor(textColor);

        Text titleText = new Text(title)
                .setFont(PdfDesignSystem.fontSemibold())
                .setFontSize(PdfDesignSystem.FONT_BODY_LG)
                .setFontColor(textColor);

        Paragraph titlePara = new Paragraph()
                .setFont(PdfDesignSystem.fontSemibold())    // paragraph-level fallback
                .add(iconText)
                .add(titleText)
                .setMargin(0)
                .setMarginBottom(PdfDesignSystem.SPACE_XS)
                .setMultipliedLeading(PdfDesignSystem.LEADING_HEADER);

        content.add(titlePara);

        // ── Body text ────────────────────────────────────────────────────
        // Font: Inter Regular — body copy default
        if (body != null && !body.isBlank()) {
            Paragraph bodyPara = new Paragraph(body)
                    .setFont(PdfDesignSystem.fontRegular())
                    .setFontSize(PdfDesignSystem.FONT_BODY)
                    .setFontColor(PdfConfig.TEXT_PRIMARY)
                    .setMultipliedLeading(PdfDesignSystem.LEADING_BODY)
                    .setMargin(0);
            content.add(bodyPara);
        }

        return wrapAsBlock(content);
    }

    // ═══════════════════════════════════════════════════════════════
    // KEY-VALUE DATA TABLE
    // ═══════════════════════════════════════════════════════════════

    /**
     * Creates a 2-column data table (35% label / 65% value).
     *
     * <p>Use {@link #addDataRow(Table, String, String)} to populate rows.
     * Label cells use Inter Regular muted; value cells use Inter Medium
     * for subtle emphasis without full bold weight.
     */
    public static Table dataTable() {
        return new Table(UnitValue.createPercentArray(new float[]{35, 65}))
                .useAllAvailableWidth()
                .setMarginTop(PdfDesignSystem.SPACE_XS)
                .setMarginBottom(PdfDesignSystem.SPACE_XS);
    }

    /**
     * Adds a label / value row to a data table.
     *
     * <p>Label: Inter Regular, muted color — de-emphasized key.
     * Value: Inter Medium — subtle emphasis, reads as "data" not "prose".
     * Leading: LEADING_DENSE (1.25×) — compact for table rows.
     */
    public static void addDataRow(Table table, String label, String value) {
        // Label cell
        table.addCell(new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(PdfDesignSystem.SPACE_XS)
                .add(new Paragraph(label)
                        .setFont(PdfDesignSystem.fontRegular())
                        .setFontSize(PdfDesignSystem.FONT_BODY_SM)
                        .setFontColor(PdfConfig.TEXT_MUTED)
                        .setMultipliedLeading(PdfDesignSystem.LEADING_DENSE)
                        .setMargin(0)));

        // Value cell — Inter Medium for data emphasis, em-dash for null
        table.addCell(new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(PdfDesignSystem.SPACE_XS)
                .add(new Paragraph(value != null ? value : "\u2014")
                        .setFont(PdfDesignSystem.fontMedium())
                        .setFontSize(PdfDesignSystem.FONT_BODY_SM)
                        .setFontColor(PdfConfig.TEXT_PRIMARY)
                        .setMultipliedLeading(PdfDesignSystem.LEADING_DENSE)
                        .setMargin(0)));
    }

    // ═══════════════════════════════════════════════════════════════
    // METRIC CARD (big number + label)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Metric card: prominent number with small label below.
     * Example: "18.3" (large) + "OVERALL RISK SCORE" (small).
     *
     * <p>Value: Inter Bold — maximum emphasis for display numbers.
     * Label: Inter SemiBold — eyebrow weight, uppercase, tracked.
     */
    public static Cell metricCard(String value, String label, DeviceRgb valueColor) {
        Cell cell = card(PdfDesignSystem.SPACE_MD);
        cell.setTextAlignment(TextAlignment.CENTER);
        cell.setVerticalAlignment(VerticalAlignment.MIDDLE);

        // Large display number — Inter Bold
        cell.add(new Paragraph(value)
                .setFont(PdfDesignSystem.fontBold())
                .setFontSize(PdfDesignSystem.FONT_DISPLAY)
                .setFontColor(valueColor)
                .setMultipliedLeading(PdfDesignSystem.LEADING_HEADER)
                .setMargin(0));

        // Eyebrow label below — Inter SemiBold uppercase with tracking
        cell.add(new Paragraph(label.toUpperCase())
                .setFont(PdfDesignSystem.fontSemibold())
                .setFontSize(PdfDesignSystem.FONT_MICRO)
                .setFontColor(PdfConfig.TEXT_MUTED)
                .setCharacterSpacing(PdfDesignSystem.TRACKING_EYEBROW)
                .setMultipliedLeading(PdfDesignSystem.LEADING_HEADER)
                .setMarginTop(PdfDesignSystem.SPACE_XS)
                .setMargin(0));

        return cell;
    }

    // ═══════════════════════════════════════════════════════════════
    // DIVIDERS & SPACING
    // ═══════════════════════════════════════════════════════════════

    /** Thin horizontal separator line. */
    public static Table horizontalDivider() {
        Table t = new Table(UnitValue.createPercentArray(new float[]{100}))
                .useAllAvailableWidth()
                .setMarginTop(PdfDesignSystem.SPACE_SM)
                .setMarginBottom(PdfDesignSystem.SPACE_SM);
        Cell c = new Cell()
                .setBorder(Border.NO_BORDER)
                .setBorderTop(new SolidBorder(PdfConfig.CARD_BORDER, 0.5f))
                .setHeight(1f);
        t.addCell(c);
        return t;
    }

    /** Vertical spacer of arbitrary height. */
    public static Paragraph spacer(float height) {
        // Use Regular so no Helvetica leaks through the invisible spacer
        return new Paragraph(" ")
                .setFont(PdfDesignSystem.fontRegular())
                .setFontSize(1f)
                .setMargin(0)
                .setMarginTop(height);
    }

    // ═══════════════════════════════════════════════════════════════
    // CUSTOM ROUNDED CORNER RENDERER
    // ═══════════════════════════════════════════════════════════════
    //
    // PRESERVED EXACTLY from Session 23 — do not modify.
    // This renderer contains the safeRadius() clamp that prevents the
    // "hourglass / crescent" pill artifact. See safeRadius() Javadoc.
    // ═══════════════════════════════════════════════════════════════

    public static class RoundedRenderer extends CellRenderer {
        private final float cornerRadius;
        private final DeviceRgb bgColor;
        private final DeviceRgb borderColor;
        private final float borderWidth;

        public RoundedRenderer(Cell modelElement, float cornerRadius,
                               DeviceRgb bgColor, DeviceRgb borderColor,
                               float borderWidth) {
            super(modelElement);
            this.cornerRadius = cornerRadius;
            this.bgColor = bgColor;
            this.borderColor = borderColor;
            this.borderWidth = borderWidth;
        }

        @Override
        public CellRenderer getNextRenderer() {
            return new RoundedRenderer((Cell) modelElement, cornerRadius,
                    bgColor, borderColor, borderWidth);
        }

        /**
         * Clamp the corner radius to the largest value that can safely fit
         * inside the given inner rectangle. Mirrors the CSS border-radius
         * corner-overlap rule (CSS Backgrounds & Borders L3 §5.5).
         *
         * <p>Without this clamp, iText's {@code roundRectangle()} generates
         * Bézier arcs that mathematically overshoot when
         * {@code radius > min(w, h) / 2}, producing the "hourglass /
         * crescent" rendering artifact around pill badges — visible as
         * pale-green/amber lens shapes bleeding above and below tiny cells.
         *
         * <p>Every browser, SVG renderer, and native UI toolkit clamps
         * identically; iText simply doesn't, so we do it here at the
         * geometry primitive layer — the correct architectural location.
         */
        private float safeRadius(float w, float h) {
            float maxRadius = Math.min(w, h) / 2f;
            float r = Math.max(0f, cornerRadius);
            return Math.min(r, maxRadius);
        }

        @Override
        public void drawBackground(DrawContext drawContext) {
            Rectangle rect = getOccupiedAreaBBox();
            PdfCanvas canvas = drawContext.getCanvas();
            canvas.saveState();
            if (bgColor != null) {
                float x = rect.getLeft() + 1;
                float y = rect.getBottom() + 1;
                float w = rect.getWidth() - 2;
                float h = rect.getHeight() - 2;
                if (w > 0 && h > 0) {
                    float r = safeRadius(w, h);
                    canvas.setFillColor(bgColor);
                    canvas.roundRectangle(x, y, w, h, r);
                    canvas.fill();
                }
            }
            canvas.restoreState();
        }

        @Override
        public void drawBorder(DrawContext drawContext) {
            Rectangle rect = getOccupiedAreaBBox();
            PdfCanvas canvas = drawContext.getCanvas();
            canvas.saveState();
            if (borderColor != null && borderWidth > 0) {
                float x = rect.getLeft() + 1;
                float y = rect.getBottom() + 1;
                float w = rect.getWidth() - 2;
                float h = rect.getHeight() - 2;
                if (w > 0 && h > 0) {
                    float r = safeRadius(w, h);
                    canvas.setStrokeColor(borderColor);
                    canvas.setLineWidth(borderWidth);
                    canvas.roundRectangle(x, y, w, h, r);
                    canvas.stroke();
                }
            }
            canvas.restoreState();
        }
    }
}