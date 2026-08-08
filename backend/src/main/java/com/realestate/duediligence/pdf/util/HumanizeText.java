package com.realestate.duediligence.pdf.util;

import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Text humanization utilities for premium report copy.
 *
 * <p>Fixes common enum/data-leak issues in generated report text:
 * <ul>
 *   <li>{@code RED_LATERITE} → "Red laterite" (enum labels)</li>
 *   <li>{@code MODERATE} in mid-sentence → "moderate" (sentence case)</li>
 *   <li>{@code LOW overall risk} → "low overall risk" (natural prose)</li>
 *   <li>{@code Property is 4 year(s) old} → "Property is 4 years old" (pluralization)</li>
 *   <li>{@code —} used as sentence connector → " — " with proper spacing</li>
 * </ul>
 *
 * <p>Design principle: <b>preserve intent, fix formatting.</b>
 * We never change what the report SAYS, only how it LOOKS.
 */
public final class HumanizeText {

    private HumanizeText() { /* utility */ }

    /** ALL-CAPS words that are legitimate acronyms — DON'T lowercase these. */
    private static final Set<String> ACRONYM_ALLOWLIST = Set.of(
            "NDMA", "CWC", "BBMP", "MCGM", "MCD", "BDA", "DDA",
            "AQI", "PDF", "GST", "PAN", "RERA", "TIN", "URL",
            "API", "SLA", "CSV", "XML", "JSON", "HTTP", "HTTPS",
            "NCR", "SEZ", "IT", "BPO", "ROI", "LTV", "EMI",
            "ID", "OK", "USA", "UK", "USD", "INR", "EUR"
    );

    /** ALL-CAPS words that should always become Title Case even if not enum-shaped. */
    private static final Set<String> RISK_LEVEL_WORDS = Set.of(
            "LOW", "MEDIUM", "MODERATE", "HIGH", "CRITICAL"
    );

    /**
     * Converts an enum-style token like {@code RED_LATERITE} to human "Red laterite".
     * Underscores become spaces, first letter capitalized, rest lowercase.
     * If input is null/blank, returns empty string.
     */
    public static String enumLabel(String enumToken) {
        if (enumToken == null || enumToken.isBlank()) return "";
        String cleaned = enumToken.trim().replace('_', ' ').toLowerCase();
        return Character.toUpperCase(cleaned.charAt(0)) + cleaned.substring(1);
    }

    /**
     * Sentence-cases a single word: {@code MODERATE} → "moderate".
     * Preserves known acronyms (NDMA, BBMP, etc.) unchanged.
     */
    public static String sentenceCaseWord(String word) {
        if (word == null || word.isBlank()) return "";
        String trimmed = word.trim();
        if (ACRONYM_ALLOWLIST.contains(trimmed)) return trimmed;
        return trimmed.toLowerCase();
    }

    /**
     * Cleans a narrative sentence/paragraph produced by the risk engine.
     * <p>Fixes:
     * <ol>
     *   <li>ALL-CAPS enum tokens with underscores → Title Case with spaces</li>
     *   <li>ALL-CAPS risk-level words (LOW, MODERATE, HIGH, CRITICAL) → lowercase mid-sentence</li>
     *   <li>Pluralization: {@code year(s)} → "years", {@code month(s)} → "months", etc.</li>
     *   <li>Trailing whitespace and double spaces collapsed</li>
     * </ol>
     * <p>Acronyms in the allowlist (NDMA, BBMP, RERA, etc.) are preserved as-is.
     *
     * @param text raw text from risk engine
     * @return humanized text safe for premium report display
     */
    public static String cleanNarrative(String text) {
        if (text == null || text.isBlank()) return "";
        String out = text;

        // 1. Enum-shaped tokens: WORD_WORD or WORD_WORD_WORD → Title case with spaces
        Pattern enumPattern = Pattern.compile("\\b[A-Z]{2,}(?:_[A-Z0-9]+)+\\b");
        Matcher m = enumPattern.matcher(out);
        StringBuilder sb = new StringBuilder();
        while (m.find()) {
            String replacement = enumLabel(m.group());
            m.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        m.appendTail(sb);
        out = sb.toString();

        // 2. Standalone ALL-CAPS risk level words → lowercase (but not at sentence start)
        for (String word : RISK_LEVEL_WORDS) {
            // Match WORD when preceded by a space (i.e. not sentence-initial)
            out = out.replaceAll("(?<=\\s)" + word + "(?=\\W|$)", word.toLowerCase());
        }

        // 3. Other ALL-CAPS words (3+ letters) mid-sentence → sentence case,
        //    UNLESS in acronym allowlist
        Pattern capsPattern = Pattern.compile("(?<=\\s)\\b[A-Z]{3,}\\b");
        Matcher cm = capsPattern.matcher(out);
        StringBuilder cb = new StringBuilder();
        while (cm.find()) {
            String word = cm.group();
            String replacement = ACRONYM_ALLOWLIST.contains(word) ? word : word.toLowerCase();
            cm.appendReplacement(cb, Matcher.quoteReplacement(replacement));
        }
        cm.appendTail(cb);
        out = cb.toString();

        // 4. Pluralization: "4 year(s)" → "4 years", "1 year(s)" → "1 year"
        out = fixPluralization(out);

        // 5. Collapse double spaces
        out = out.replaceAll("\\s{2,}", " ").trim();

        return out;
    }

    /**
     * Replaces amateur pluralization tokens like {@code 4 year(s) old}
     * with proper English: {@code 4 years old} or {@code 1 year old}.
     */
    private static String fixPluralization(String text) {
        // Pattern: [number] [word](s) → depends on number
        Pattern p = Pattern.compile("(\\d+)\\s+(\\w+)\\(s\\)");
        Matcher m = p.matcher(text);
        StringBuilder sb = new StringBuilder();
        while (m.find()) {
            int num = Integer.parseInt(m.group(1));
            String word = m.group(2);
            String replacement = num == 1
                    ? num + " " + word
                    : num + " " + word + "s";
            m.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        m.appendTail(sb);
        return sb.toString();
    }

    /**
     * Converts a "status" enum like {@code NO_DATA}, {@code LIVE}, {@code MOCK}
     * into a display label. Retained for consistency, delegates to {@link #enumLabel}.
     */
    public static String statusLabel(String status) {
        return enumLabel(status);
    }
}