// backend/src/main/java/com/realestate/duediligence/pdf/util/IndianNumberFormatter.java
package com.realestate.duediligence.pdf.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Indian number formatting utility — the standard for Indian real estate.
 *
 * <p>Handles the "lakh/crore" comma system used across India:
 * <ul>
 *   <li>1,000        → 1,000            (thousand)</li>
 *   <li>1,00,000     → 1 Lakh           (100 thousand)</li>
 *   <li>1,00,00,000  → 1 Crore          (10 million)</li>
 * </ul>
 *
 * <p>Also provides ₹ symbol formatting and human-readable abbreviations
 * (e.g., ₹2.4 Cr) for large numbers where full digits would overflow layout.
 *
 * <p>Thread-safe. All methods are pure static functions.
 */
public final class IndianNumberFormatter {

    private static final BigDecimal ONE_LAKH  = new BigDecimal("100000");
    private static final BigDecimal ONE_CRORE = new BigDecimal("10000000");

    /** ₹ Unicode = U+20B9. Ensure fonts used in PDF support this glyph. */
    public static final String RUPEE_SYMBOL = "\u20B9";

    private IndianNumberFormatter() { /* utility class */ }

    // ═══════════════════════════════════════════════════════════════
    // FULL FORMATTING (with Indian lakh/crore commas)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Formats a number with Indian comma placement.
     * Example: 24000000 → "2,40,00,000"
     *
     * @param value the number to format (accepts null, returns "—")
     * @return Indian-formatted string, or "—" if null
     */
    public static String format(Number value) {
        if (value == null) return "\u2014"; // em dash
        return format(new BigDecimal(value.toString()));
    }

    public static String format(BigDecimal value) {
        if (value == null) return "\u2014";

        // Handle negatives cleanly
        boolean negative = value.signum() < 0;
        BigDecimal absVal = value.abs().setScale(0, RoundingMode.HALF_UP);

        String digits = absVal.toPlainString();
        String formatted = applyIndianCommas(digits);

        return negative ? "-" + formatted : formatted;
    }

    /**
     * Formats with ₹ prefix. Example: 2400000 → "₹24,00,000".
     */
    public static String formatCurrency(Number value) {
        if (value == null) return RUPEE_SYMBOL + " \u2014";
        return RUPEE_SYMBOL + " " + format(value);
    }

    // ═══════════════════════════════════════════════════════════════
    // ABBREVIATED FORMATTING (for space-constrained layouts)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Compact human-readable form.
     * Examples:
     *   999          → "999"
     *   45,000       → "45,000"
     *   2,50,000     → "2.50 L"
     *   24,00,000    → "24.00 L"
     *   2,40,00,000  → "2.40 Cr"
     */
    public static String formatCompact(Number value) {
        if (value == null) return "\u2014";
        BigDecimal v = new BigDecimal(value.toString()).abs();

        if (v.compareTo(ONE_CRORE) >= 0) {
            return v.divide(ONE_CRORE, 2, RoundingMode.HALF_UP).toPlainString() + " Cr";
        }
        if (v.compareTo(ONE_LAKH) >= 0) {
            return v.divide(ONE_LAKH, 2, RoundingMode.HALF_UP).toPlainString() + " L";
        }
        return format(value);
    }

    /**
     * Compact currency form. Example: 24000000 → "₹2.40 Cr".
     */
    public static String formatCurrencyCompact(Number value) {
        if (value == null) return RUPEE_SYMBOL + " \u2014";
        return RUPEE_SYMBOL + " " + formatCompact(value);
    }

    // ═══════════════════════════════════════════════════════════════
    // SPECIALIZED FORMATTERS
    // ═══════════════════════════════════════════════════════════════

    /**
     * Price per square foot — always shown with ₹ and 2 decimals dropped.
     * Example: 9600 → "₹9,600 / sq ft"
     */
    public static String formatPricePerSqft(Number value) {
        if (value == null) return "\u2014";
        return RUPEE_SYMBOL + format(value) + " / sq ft";
    }

    /**
     * Area formatting with unit.
     * Example: 2500 → "2,500 sq ft"
     */
    public static String formatArea(Number sqft) {
        if (sqft == null) return "\u2014";
        return format(sqft) + " sq ft";
    }

    /**
     * Percentage formatting.
     * Example: 0.15 → "15%", 15.0 → "15%".
     * Auto-detects if input is fraction (0-1) or percentage (0-100).
     */
    public static String formatPercent(Double value) {
        if (value == null) return "\u2014";
        double v = value <= 1.0 ? value * 100 : value;
        // Show integer if whole, else 1 decimal
        return (v == Math.floor(v))
                ? String.format("%.0f%%", v)
                : String.format("%.1f%%", v);
    }

    /**
     * Score formatting for 0-100 risk scores.
     * Example: 18.3 → "18.3 / 100"
     */
    public static String formatScore(Double score) {
        if (score == null) return "\u2014";
        return String.format("%.1f / 100", score);
    }

    // ═══════════════════════════════════════════════════════════════
    // INTERNAL — Indian comma placement algorithm
    // ═══════════════════════════════════════════════════════════════

    /**
     * Applies Indian comma placement to a digit string.
     * Rule: rightmost 3 digits grouped, then every 2 digits.
     * Example: "12345678" → "1,23,45,678"
     */
    private static String applyIndianCommas(String digits) {
        int len = digits.length();
        if (len <= 3) return digits;

        StringBuilder sb = new StringBuilder();
        // Last 3 digits (thousands group)
        String last3 = digits.substring(len - 3);
        String remaining = digits.substring(0, len - 3);

        // Insert commas every 2 digits in the remaining part (right to left)
        StringBuilder groupedRemaining = new StringBuilder();
        int count = 0;
        for (int i = remaining.length() - 1; i >= 0; i--) {
            if (count == 2) {
                groupedRemaining.insert(0, ',');
                count = 0;
            }
            groupedRemaining.insert(0, remaining.charAt(i));
            count++;
        }

        sb.append(groupedRemaining).append(',').append(last3);
        return sb.toString();
    }
}