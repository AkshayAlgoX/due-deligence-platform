package com.realestate.duediligence.config;

import java.util.EnumMap;
import java.util.Map;

import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.realestate.duediligence.enums.RiskCategory;
import com.realestate.duediligence.enums.RiskLevel;
import com.realestate.duediligence.pdf.util.PdfFontManager;

/**
 * Complete design system for premium PDF reports.
 *
 * <p>Sits alongside {@link PdfConfig} (which is preserved for backward
 * compatibility). This class adds typography scale, spacing scale,
 * category icons, semantic color mapping, and (as of Session 25)
 * a centralized font family accessor backed by {@link PdfFontManager}.
 *
 * <p>All constants are declared here so future design tweaks happen
 * in ONE place. No renderer should hard-code fonts, sizes, or colors.
 *
 * <p>Design language: <b>Inter typography</b> + <b>Bloomberg Terminal</b>
 * data density + <b>Stripe Docs</b> whitespace.
 */
public final class PdfDesignSystem {

    private PdfDesignSystem() { /* constants only */ }

    // ═══════════════════════════════════════════════════════════════
    // TYPOGRAPHY SCALE (modular scale, ratio ~1.25)
    // ═══════════════════════════════════════════════════════════════

    public static final float FONT_DISPLAY   = 32f;  // Cover page title
    public static final float FONT_H1        = 22f;  // Section headers on new page
    public static final float FONT_H2        = 16f;  // Sub-section titles
    public static final float FONT_H3        = 12f;  // Card titles
    public static final float FONT_BODY_LG   = 11f;  // Prominent body text
    public static final float FONT_BODY      = 10f;  // Default body
    public static final float FONT_BODY_SM   = 9f;   // Dense tables
    public static final float FONT_CAPTION   = 8f;   // Labels, footnotes
    public static final float FONT_MICRO     = 7f;   // Legal fine print

    // ═══════════════════════════════════════════════════════════════
    // LEADING (line-height multipliers for premium look)
    // ═══════════════════════════════════════════════════════════════

    /** Body paragraph line spacing — 1.45× font size for comfortable reading. */
    public static final float LEADING_BODY = 1.45f;

    /** Header line spacing — tighter for large display text. */
    public static final float LEADING_HEADER = 1.15f;

    /** Compact leading for dense data rows. */
    public static final float LEADING_DENSE = 1.25f;

    // ═══════════════════════════════════════════════════════════════
    // CHARACTER SPACING (letter-spacing)
    // ═══════════════════════════════════════════════════════════════

    /** Uppercase eyebrow labels: +0.08em spacing for premium feel. */
    public static final float TRACKING_EYEBROW = 1.5f;

    /** Uppercase section headers: subtle spacing. */
    public static final float TRACKING_HEADER = 0.5f;

    // ═══════════════════════════════════════════════════════════════
    // SPACING SCALE (8pt grid)
    // ═══════════════════════════════════════════════════════════════

    public static final float SPACE_XS  = 4f;
    public static final float SPACE_SM  = 8f;
    public static final float SPACE_MD  = 16f;
    public static final float SPACE_LG  = 24f;
    public static final float SPACE_XL  = 32f;
    public static final float SPACE_2XL = 48f;

    // ═══════════════════════════════════════════════════════════════
    // BORDER RADIUS
    // ═══════════════════════════════════════════════════════════════

    public static final float RADIUS_SM   = 4f;
    public static final float RADIUS_MD   = 8f;
    public static final float RADIUS_LG   = 12f;
    public static final float RADIUS_PILL = 100f;  // Fully rounded

    // ═══════════════════════════════════════════════════════════════
    // EXTENDED COLOR PALETTE
    // ═══════════════════════════════════════════════════════════════

    public static final DeviceRgb NAVY_900 = new DeviceRgb(15, 23, 42);
    public static final DeviceRgb NAVY_700 = new DeviceRgb(30, 41, 59);

    public static final DeviceRgb SUCCESS = new DeviceRgb(22, 163, 74);
    public static final DeviceRgb SUCCESS_BG = new DeviceRgb(240, 253, 244);

    public static final DeviceRgb WARNING = new DeviceRgb(217, 119, 6);
    public static final DeviceRgb WARNING_BG = new DeviceRgb(254, 243, 199);

    public static final DeviceRgb DANGER = new DeviceRgb(220, 38, 38);
    public static final DeviceRgb DANGER_BG = new DeviceRgb(254, 226, 226);

    public static final DeviceRgb INFO = new DeviceRgb(14, 165, 233);
    public static final DeviceRgb INFO_BG = new DeviceRgb(224, 242, 254);

    public static final DeviceRgb WHITE = new DeviceRgb(255, 255, 255);

    // ═══════════════════════════════════════════════════════════════
    // FONT FAMILY ACCESSORS (delegates to PdfFontManager)
    // ═══════════════════════════════════════════════════════════════
    //
    // Every renderer should apply fonts via these accessors, e.g.:
    //   .setFont(PdfDesignSystem.fontRegular())
    //   .setFont(PdfDesignSystem.fontSemibold())
    //
    // This creates a single choke point should we ever swap font families.
    // ═══════════════════════════════════════════════════════════════

    /** Body copy — Inter Regular (400). Default for all prose. */
    public static PdfFont fontRegular() {
        return PdfFontManager.regular();
    }

    /** Subtle emphasis — Inter Medium (500). For value cells, dense data. */
    public static PdfFont fontMedium() {
        return PdfFontManager.medium();
    }

    /** Premium emphasis — Inter SemiBold (600). For card titles, subsection headers. */
    public static PdfFont fontSemibold() {
        return PdfFontManager.semibold();
    }

    /** Maximum emphasis — Inter Bold (700). For display numbers and H1 headers only. */
    public static PdfFont fontBold() {
        return PdfFontManager.bold();
    }

    // ═══════════════════════════════════════════════════════════════
    // RISK LEVEL → COLOR MAPPING
    // ═══════════════════════════════════════════════════════════════

    public static DeviceRgb colorForLevel(RiskLevel level) {
        if (level == null) return PdfConfig.TEXT_MUTED;
        switch (level) {
            case LOW:      return PdfConfig.LOW_RISK_COLOR;
            case MEDIUM:   return PdfConfig.MOD_RISK_COLOR;
            case HIGH:     return PdfConfig.HIGH_RISK_COLOR;
            case CRITICAL: return new DeviceRgb(153, 27, 27);
            default:       return PdfConfig.TEXT_MUTED;
        }
    }

    public static DeviceRgb bgForLevel(RiskLevel level) {
        if (level == null) return PdfConfig.CARD_BG;
        switch (level) {
            case LOW:      return PdfConfig.LOW_RISK_BG;
            case MEDIUM:   return PdfConfig.MOD_RISK_BG;
            case HIGH:     return PdfConfig.HIGH_RISK_BG;
            case CRITICAL: return new DeviceRgb(254, 202, 202);
            default:       return PdfConfig.CARD_BG;
        }
    }

    public static DeviceRgb borderForLevel(RiskLevel level) {
        if (level == null) return PdfConfig.CARD_BORDER;
        switch (level) {
            case LOW:      return PdfConfig.LOW_RISK_BORDER;
            case MEDIUM:   return PdfConfig.MOD_RISK_BORDER;
            case HIGH:     return PdfConfig.HIGH_RISK_BORDER;
            case CRITICAL: return new DeviceRgb(220, 38, 38);
            default:       return PdfConfig.CARD_BORDER;
        }
    }

    public static String labelForLevel(RiskLevel level) {
        if (level == null) return "N/A";
        switch (level) {
            case LOW:      return "LOW RISK";
            case MEDIUM:   return "MODERATE";
            case HIGH:     return "HIGH RISK";
            case CRITICAL: return "CRITICAL";
            default:       return level.name();
        }
    }

    public static RiskLevel levelFromScore(double score) {
        if (score <= 25)  return RiskLevel.LOW;
        if (score <= 50)  return RiskLevel.MEDIUM;
        if (score <= 75)  return RiskLevel.HIGH;
        return RiskLevel.CRITICAL;
    }

    // ═══════════════════════════════════════════════════════════════
    // RISK CATEGORY → ICON & DISPLAY NAME
    // ═══════════════════════════════════════════════════════════════

    private static final Map<RiskCategory, String> CATEGORY_ICONS = new EnumMap<>(RiskCategory.class);
    private static final Map<RiskCategory, String> CATEGORY_NAMES = new EnumMap<>(RiskCategory.class);

    static {
        // Icons intentionally disabled — Session 23 decision, retained for consistency.
        // Even with Inter (which has full Unicode), icons would compete with pill badges.
        CATEGORY_ICONS.put(RiskCategory.FLOOD,         "");
        CATEGORY_ICONS.put(RiskCategory.LEGAL,         "");
        CATEGORY_ICONS.put(RiskCategory.TAX,           "");
        CATEGORY_ICONS.put(RiskCategory.ZONING,        "");
        CATEGORY_ICONS.put(RiskCategory.ENVIRONMENTAL, "");
        CATEGORY_ICONS.put(RiskCategory.MARKET,        "");

        CATEGORY_NAMES.put(RiskCategory.FLOOD,         "Flood Risk");
        CATEGORY_NAMES.put(RiskCategory.LEGAL,         "Legal & Ownership");
        CATEGORY_NAMES.put(RiskCategory.TAX,           "Tax Compliance");
        CATEGORY_NAMES.put(RiskCategory.ZONING,        "Zoning & Permits");
        CATEGORY_NAMES.put(RiskCategory.ENVIRONMENTAL, "Environmental");
        CATEGORY_NAMES.put(RiskCategory.MARKET,        "Market & Condition");
    }

    public static String iconForCategory(RiskCategory category) {
        return CATEGORY_ICONS.getOrDefault(category, "");
    }

    public static String displayNameForCategory(RiskCategory category) {
        if (category == null) return "Unknown";
        return CATEGORY_NAMES.getOrDefault(category, category.name());
    }

    // ═══════════════════════════════════════════════════════════════
    // WATERMARK
    // ═══════════════════════════════════════════════════════════════

    public static final float WATERMARK_OPACITY = 0.04f;
    public static final String WATERMARK_TEXT = "DUE DILIGENCE";
}