package com.realestate.duediligence.pdf.util;

import java.io.IOException;
import java.io.InputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.font.PdfFontFactory.EmbeddingStrategy;

import jakarta.annotation.PostConstruct;

/**
 * Centralized font loader for premium PDF reports.
 *
 * <p>Loads the Inter font family (Regular, Medium, SemiBold, Bold) from
 * classpath resources once at application startup and exposes them as
 * {@link PdfFont} instances for use by all renderers.
 *
 * <p>Inter is the same font used by GitHub, Figma, Notion, Linear, and
 * Vercel — chosen for its excellent screen and print legibility, full
 * Unicode coverage (including ₹, ✓, ✖, and all typographic dashes),
 * and its "modern SaaS" visual identity.
 *
 * <p>Every renderer MUST fetch fonts via {@link #regular()}, {@link #medium()},
 * {@link #semibold()}, or {@link #bold()} — never via {@code PdfFontFactory}
 * directly. This ensures every text element uses the embedded Inter font
 * and avoids Helvetica leaking through.
 *
 * <p>If font loading fails at startup (e.g. missing TTF file), the loader
 * falls back to built-in Helvetica so PDF generation still works — but
 * the fallback is logged as an ERROR so the ops team can fix it.
 */
@Component
public class PdfFontManager {

    private static final Logger log = LoggerFactory.getLogger(PdfFontManager.class);

    private static final String FONT_PATH_PREFIX = "fonts/";

    private PdfFont regular;
    private PdfFont medium;
    private PdfFont semibold;
    private PdfFont bold;

    private boolean loaded = false;

    @PostConstruct
    public synchronized void loadFonts() {
        try {
            regular  = loadFont("Inter-Regular.otf");
            medium   = loadFont("Inter-Medium.otf");
            semibold = loadFont("Inter-SemiBold.otf");
            bold     = loadFont("Inter-Bold.otf");
            loaded = true;
            log.info("[pdf-fonts] Successfully loaded Inter font family (4 weights)");
        } catch (Exception e) {
            log.error("[pdf-fonts] FATAL: Could not load Inter fonts — PDFs will use fallback Helvetica. Error: {}",
                      e.getMessage(), e);
            loadFallbackFonts();
        }
    }

    private PdfFont loadFont(String filename) throws IOException {
        String path = FONT_PATH_PREFIX + filename;
        ClassPathResource resource = new ClassPathResource(path);
        if (!resource.exists()) {
            throw new IOException("Font file not found on classpath: " + path);
        }
        try (InputStream is = resource.getInputStream()) {
            byte[] bytes = is.readAllBytes();
            return PdfFontFactory.createFont(
                    bytes,
                    PdfEncodings.IDENTITY_H,
                    EmbeddingStrategy.PREFER_EMBEDDED
            );
        }
    }

    private void loadFallbackFonts() {
        try {
            PdfFont helv     = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA);
            PdfFont helvBold = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD);
            regular = helv;
            medium = helv;
            semibold = helvBold;
            bold = helvBold;
            loaded = true;
        } catch (Exception e) {
            log.error("[pdf-fonts] Even fallback failed — PDF font operations will throw NPE", e);
        }
    }

    /** Body text default — Inter Regular 400. */
    public PdfFont regular() {
        ensureLoaded();
        return regular;
    }

    /** Slightly-emphasized text — Inter Medium 500. Used for value cells, subtle emphasis. */
    public PdfFont medium() {
        ensureLoaded();
        return medium;
    }

    /**
     * Premium emphasis — Inter SemiBold 600.
     * Use for card titles, subsection headers, metric labels.
     * SemiBold reads as "heavy" without the visual noise of full Bold.
     */
    public PdfFont semibold() {
        ensureLoaded();
        return semibold;
    }

    /**
     * Maximum emphasis — Inter Bold 700.
     * Use ONLY for large display numbers (score, metric values) and
     * top-level H1 section headers. Avoid Bold in body copy — SemiBold
     * is the premium alternative.
     */
    public PdfFont bold() {
        ensureLoaded();
        return bold;
    }

    /** Diagnostic: has font loading succeeded? */
    public boolean isLoaded() {
        return loaded;
    }

    private void ensureLoaded() {
        if (!loaded || regular == null) {
            throw new IllegalStateException(
                "PdfFontManager not initialized. Ensure @PostConstruct ran successfully. "
              + "If running outside Spring context, call loadFonts() manually."
            );
        }
    }
}