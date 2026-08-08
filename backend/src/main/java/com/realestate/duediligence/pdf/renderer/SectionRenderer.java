// backend/src/main/java/com/realestate/duediligence/pdf/renderer/SectionRenderer.java
package com.realestate.duediligence.pdf.renderer;

import com.itextpdf.layout.Document;
import com.realestate.duediligence.service.PdfReportDataProvider.PdfReportBundle;

/**
 * Renders one section of a premium PDF report.
 *
 * <p>Contract:
 * <ul>
 *   <li>Implementations receive a fully-loaded data bundle</li>
 *   <li>Must handle null fields gracefully — some data may be missing</li>
 *   <li>Should NOT add page breaks unless section demands its own page</li>
 *   <li>Should NOT modify document margins or global settings</li>
 *   <li>Must be stateless — safe to be a Spring singleton</li>
 * </ul>
 */
public interface SectionRenderer {

    /**
     * Renders this section into the given document.
     *
     * @param document iText document (already initialized)
     * @param bundle   all structured data available for this report
     */
    void render(Document document, PdfReportBundle bundle);
}