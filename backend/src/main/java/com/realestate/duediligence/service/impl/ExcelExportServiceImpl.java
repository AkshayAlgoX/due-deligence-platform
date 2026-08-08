package com.realestate.duediligence.service.impl;

import com.realestate.duediligence.aggregation.AggregatedPropertyResponse;
import com.realestate.duediligence.dto.DueDiligenceReportResponse;
import com.realestate.duediligence.dto.PropertyResponse;
import com.realestate.duediligence.dto.RiskBreakdownDto;
import com.realestate.duediligence.dto.RiskFactorDto;
import com.realestate.duediligence.export.excel.ExcelStyleFactory;
import com.realestate.duediligence.pdf.util.HumanizeText;
import com.realestate.duediligence.pdf.util.IndianNumberFormatter;
import com.realestate.duediligence.service.ExcelExportService;
import com.realestate.duediligence.service.PdfReportDataProvider.PdfReportBundle;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/**
 * ExcelExportServiceImpl — premium institutional Excel workbook generator (v2).
 *
 * Polish pass fixes:
 *  1. Sheet 1 risk breakdown table repositioned to column A
 *  2. Executive summary always renders (with fallback if empty)
 *  3. Sheet 3 status column widened + simplified color logic
 *  4. Real vertical spacing before Sheet 2 checklist header
 *  5. Sheet 3 module column widened
 *  6. Em-dash separators in subtitles (not middle dots)
 *  7. KPI labels 9pt bold
 *  8. Sheet 2 wrapped rows taller minimum height
 *  9. Sheet 3 coverage note uses navy body text
 * 10. "Property db" → "Property Database" via label patch
 */
@Service
public class ExcelExportServiceImpl implements ExcelExportService {

    private static final Logger log = LoggerFactory.getLogger(ExcelExportServiceImpl.class);

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH)
                             .withZone(ZoneId.systemDefault());

    // ── Column widths (chars × 256) ───────────────────────────────────────────
    // Sheet 1 — SINGLE table layout: cols A-F used for everything
    private static final int W_S1_LABEL     = 26 * 256;   // A: property label / category
    private static final int W_S1_VALUE     = 40 * 256;   // B: property value / (spans below table)
    private static final int W_S1_WEIGHT    = 10 * 256;   // C: weight
    private static final int W_S1_SCORE     = 10 * 256;   // D: score
    private static final int W_S1_LEVEL     = 14 * 256;   // E: risk level
    private static final int W_S1_SOURCE    = 26 * 256;   // F: data source

    // Sheet 2
    private static final int W2_NUM         =  5 * 256;
    private static final int W2_CAT         = 22 * 256;
    private static final int W2_SCORE       = 10 * 256;
    private static final int W2_LEVEL       = 14 * 256;
    private static final int W2_WEIGHT      = 10 * 256;
    private static final int W2_SOURCE      = 22 * 256;
    private static final int W2_ANALYSIS    = 48 * 256;
    private static final int W2_REC         = 48 * 256;

    // Sheet 3 — widened Module + Status
    private static final int W3_MODULE      = 32 * 256;   // was 26
    private static final int W3_STATUS      = 28 * 256;   // was 18
    private static final int W3_VALUE       = 22 * 256;
    private static final int W3_NOTE        = 44 * 256;   // was 36

    // ── Row heights ───────────────────────────────────────────────────────────
    private static final short RH_BANNER    = 600;
    private static final short RH_EYEBROW   = 380;
    private static final short RH_SUBTITLE  = 420;
    private static final short RH_SPACER    = 200;
    private static final short RH_BIG_SPACE = 400;   // NEW: bigger visual gap
    private static final short RH_SECTION   = 480;
    private static final short RH_KPI_LABEL = 340;
    private static final short RH_KPI_VALUE = 700;
    private static final short RH_TABLE_HDR = 440;
    private static final short RH_DATA      = 380;
    private static final short RH_SUMMARY   = 1200;  // was 800 — taller default

    private static final String[] CHECKLIST = {
        "Verify ownership title documents with sub-registrar office",
        "Obtain encumbrance certificate for the past 15 years",
        "Confirm zoning compliance and land-use certificate from local authority",
        "Check for any pending litigation or court orders on the property",
        "Validate tax receipts and ensure no outstanding dues",
        "Obtain environmental clearance if property is near industrial zones",
        "Conduct physical site inspection and boundary verification"
    };

    // Sheet 1 uses cols 0-5 (6 columns wide). Constants for merging.
    private static final int S1_LAST_COL = 5;
    private static final int S2_LAST_COL = 7;
    private static final int S3_LAST_COL = 3;

    // =========================================================================
    // ENTRY POINT
    // =========================================================================

    @Override
    public byte[] generateExcelReport(PdfReportBundle bundle) {
        if (bundle == null || bundle.report == null) {
            throw new IllegalArgumentException("PdfReportBundle or bundle.report must not be null");
        }

        try (XSSFWorkbook wb = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            ExcelStyleFactory sf = new ExcelStyleFactory(wb);

            buildSheet1(wb, sf, bundle);
            buildSheet2(wb, sf, bundle);
            buildSheet3(wb, sf, bundle);

            wb.write(baos);
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }

    // =========================================================================
    // SHEET 1 — EXECUTIVE DASHBOARD
    // =========================================================================

    private void buildSheet1(XSSFWorkbook wb, ExcelStyleFactory sf, PdfReportBundle bundle) {
        XSSFSheet sheet = wb.createSheet("Executive Dashboard");

        // Column widths — 6 columns total (A-F)
        sheet.setColumnWidth(0, W_S1_LABEL);
        sheet.setColumnWidth(1, W_S1_VALUE);
        sheet.setColumnWidth(2, W_S1_WEIGHT);
        sheet.setColumnWidth(3, W_S1_SCORE);
        sheet.setColumnWidth(4, W_S1_LEVEL);
        sheet.setColumnWidth(5, W_S1_SOURCE);

        DueDiligenceReportResponse report    = bundle.report;
        RiskBreakdownDto           breakdown = bundle.breakdown;
        AggregatedPropertyResponse agg       = bundle.aggregated;
        PropertyResponse           prop      = agg != null ? agg.getProperty() : null;

        int r = 0;

        // Eyebrow
        r = addBanner(sheet, r, "DUE DILIGENCE REPORT",
                sf.eyebrow(), RH_EYEBROW, 0, S1_LAST_COL);

        // Title
        r = addBanner(sheet, r, "Property Risk Assessment",
                sf.sheetTitle(), RH_BANNER, 0, S1_LAST_COL);

        // Subtitle — em-dashes with proper spacing
        String address  = safeText(report.getPropertyAddress(), "Not specified");
        String reportId = report.getId() != null ? "#" + report.getId() : "";
        String version  = report.getVersion() != null
                          ? "Version " + report.getVersion()
                          : "Version 1";
        String subtitle = address + "   \u2014   Report " + reportId + "   \u2014   " + version;
        r = addBanner(sheet, r, subtitle, sf.sheetSubtitle(), RH_SUBTITLE, 0, S1_LAST_COL);

        r = addSpacer(sheet, r);

        // KPI cards — now spans 6 columns: 0-1 score, 2-3 level, 4-5 status
        r = buildKpiCards(sheet, wb, sf, r, report, breakdown);

        r = addBigSpacer(sheet, r);

        // Property Details section
        r = addSectionHeader(sheet, r,
                "  PROPERTY DETAILS", sf.sectionHeaderDark(), 0, S1_LAST_COL);
        r = buildPropertyOverview(sheet, sf, r, report, prop);

        r = addBigSpacer(sheet, r);

        // Risk Breakdown section — table now starts at column A
        r = addSectionHeader(sheet, r,
                "  RISK CATEGORY BREAKDOWN", sf.sectionHeaderEmerald(), 0, S1_LAST_COL);
        r = buildRiskTableHeader(sheet, sf, r);
        r = buildRiskFactorRows(sheet, sf, r, breakdown);

        r = addBigSpacer(sheet, r);

        // Executive Summary
        r = addSectionHeader(sheet, r,
                "  EXECUTIVE SUMMARY", sf.sectionHeaderDark(), 0, S1_LAST_COL);
        r = buildExecutiveSummary(sheet, wb, r, report, breakdown, prop);

        // Data quality callout
        if (breakdown != null && breakdown.isDataIncomplete()) {
            r = addSpacer(sheet, r);
            r = buildDataQualityCallout(sheet, sf, r, breakdown);
        }

        sheet.createFreezePane(0, 3);
    }

    private int buildKpiCards(XSSFSheet sheet, XSSFWorkbook wb, ExcelStyleFactory sf,
                               int startRow,
                               DueDiligenceReportResponse report,
                               RiskBreakdownDto breakdown) {

        double score = breakdown != null ? breakdown.getOverallScore() : 0.0;
        String levelRaw = breakdown != null && breakdown.getOverallLevel() != null
                          ? breakdown.getOverallLevel().name() : "LOW";
        String level  = labelForLevel(levelRaw);
        String status = report.getStatus() != null
                        ? HumanizeText.enumLabel(report.getStatus().name())
                        : "\u2014";
        String date   = report.getCreatedAt() != null
                        ? DATE_FMT.format(report.getCreatedAt())
                        : "\u2014";

        // Label row — spans 3 cards: 0-1, 2-3, 4-5
        Row labelRow = sheet.createRow(startRow);
        labelRow.setHeight(RH_KPI_LABEL);

        applyMergedKpiLabel(sheet, wb, sf, labelRow, 0, 1, "OVERALL RISK SCORE",
                ExcelStyleFactory.HEX_KPI_SCORE_BG);
        applyMergedKpiLabel(sheet, wb, sf, labelRow, 2, 3, "RISK LEVEL",
                ExcelStyleFactory.HEX_KPI_LEVEL_BG);
        applyMergedKpiLabel(sheet, wb, sf, labelRow, 4, 5, "STATUS",
                ExcelStyleFactory.HEX_KPI_STATUS_BG);

        sheet.addMergedRegion(new CellRangeAddress(startRow, startRow, 0, 1));
        sheet.addMergedRegion(new CellRangeAddress(startRow, startRow, 2, 3));
        sheet.addMergedRegion(new CellRangeAddress(startRow, startRow, 4, 5));

        // Value row
        int vr = startRow + 1;
        Row valueRow = sheet.createRow(vr);
        valueRow.setHeight(RH_KPI_VALUE);

        XSSFCellStyle scoreStyle = buildKpiValueStyle(wb, sf,
                ExcelStyleFactory.HEX_KPI_SCORE_BG,
                ExcelStyleFactory.HEX_EMERALD, 20);
        applyMergedKpiValue(sheet, valueRow, 0, 1,
                String.format("%.1f", score), scoreStyle);

        String levelHex = levelColorHex(levelRaw);
        XSSFCellStyle levelStyle = buildKpiValueStyle(wb, sf,
                ExcelStyleFactory.HEX_KPI_LEVEL_BG, levelHex, 18);
        applyMergedKpiValue(sheet, valueRow, 2, 3, level, levelStyle);

        XSSFCellStyle statusStyle = buildKpiValueStyle(wb, sf,
                ExcelStyleFactory.HEX_KPI_STATUS_BG,
                ExcelStyleFactory.HEX_EMERALD, 15);
        applyMergedKpiValue(sheet, valueRow, 4, 5, status, statusStyle);

        sheet.addMergedRegion(new CellRangeAddress(vr, vr, 0, 1));
        sheet.addMergedRegion(new CellRangeAddress(vr, vr, 2, 3));
        sheet.addMergedRegion(new CellRangeAddress(vr, vr, 4, 5));

        // Sub-label row
        int dr = vr + 1;
        Row dateRow = sheet.createRow(dr);
        dateRow.setHeight(RH_KPI_LABEL);

        applyMergedKpiSubLabel(sheet, wb, sf, dateRow, 0, 1,
                "Generated " + date, ExcelStyleFactory.HEX_KPI_SCORE_BG);
        applyMergedKpiSubLabel(sheet, wb, sf, dateRow, 2, 3,
                "out of 100", ExcelStyleFactory.HEX_KPI_LEVEL_BG);
        applyMergedKpiSubLabel(sheet, wb, sf, dateRow, 4, 5,
                "Report ID " + (report.getId() != null ? "#" + report.getId() : "\u2014"),
                ExcelStyleFactory.HEX_KPI_STATUS_BG);

        sheet.addMergedRegion(new CellRangeAddress(dr, dr, 0, 1));
        sheet.addMergedRegion(new CellRangeAddress(dr, dr, 2, 3));
        sheet.addMergedRegion(new CellRangeAddress(dr, dr, 4, 5));

        return dr + 1;
    }

    private void applyMergedKpiLabel(XSSFSheet sheet, XSSFWorkbook wb, ExcelStyleFactory sf,
                                      Row row, int firstCol, int lastCol,
                                      String text, String bgHex) {
        XSSFCellStyle style = blendKpiBg(wb, sf.kpiLabel(), sf, bgHex);
        Cell c = row.createCell(firstCol);
        c.setCellValue(text);
        c.setCellStyle(style);
        for (int col = firstCol + 1; col <= lastCol; col++) {
            row.createCell(col).setCellStyle(style);
        }
    }

    private void applyMergedKpiValue(XSSFSheet sheet, Row row, int firstCol, int lastCol,
                                      String text, XSSFCellStyle style) {
        Cell c = row.createCell(firstCol);
        c.setCellValue(text);
        c.setCellStyle(style);
        for (int col = firstCol + 1; col <= lastCol; col++) {
            row.createCell(col).setCellStyle(style);
        }
    }

    private void applyMergedKpiSubLabel(XSSFSheet sheet, XSSFWorkbook wb, ExcelStyleFactory sf,
                                         Row row, int firstCol, int lastCol,
                                         String text, String bgHex) {
        XSSFCellStyle style = blendKpiBg(wb, sf.dataMutedCenter(), sf, bgHex);
        Cell c = row.createCell(firstCol);
        c.setCellValue(text);
        c.setCellStyle(style);
        for (int col = firstCol + 1; col <= lastCol; col++) {
            row.createCell(col).setCellStyle(style);
        }
    }

    private int buildPropertyOverview(XSSFSheet sheet, ExcelStyleFactory sf, int startRow,
                                       DueDiligenceReportResponse report,
                                       PropertyResponse prop) {
        int r = startRow;

        String address  = safeText(report.getPropertyAddress(), "Not specified");
        String city     = prop != null ? safeText(prop.getCity(), "Not specified") : "Not specified";
        String state    = prop != null ? safeText(prop.getState(), "Not specified") : "Not specified";
        String zip      = prop != null ? safeText(prop.getZipCode(), "") : "";
        String location = city
                          + ("Not specified".equals(state) ? "" : ", " + state)
                          + (zip.isEmpty() ? "" : " \u2013 " + zip);

        String propType = prop != null && prop.getPropertyType() != null
                          ? HumanizeText.enumLabel(prop.getPropertyType())
                          : "Not specified";

        String area = "Not specified";
        if (prop != null && prop.getArea() != null) {
            area = String.format("%.0f sq ft", prop.getArea());
        }

        String marketValue = "Not specified";
        if (prop != null && prop.getMarketValue() != null) {
            marketValue = IndianNumberFormatter.formatCurrencyCompact(prop.getMarketValue())
                          + "  (" + IndianNumberFormatter.formatCurrency(prop.getMarketValue()) + ")";
        }

        String yearBuilt = "Not specified";
        if (prop != null && prop.getYearBuilt() != null) {
            yearBuilt = String.valueOf(prop.getYearBuilt());
        }

        String rooms = "Not specified";
        if (prop != null && prop.getBedrooms() != null && prop.getBathrooms() != null) {
            rooms = prop.getBedrooms() + " bed, " + prop.getBathrooms() + " bath";
        } else if (prop != null && prop.getBedrooms() != null) {
            rooms = prop.getBedrooms() + " bed";
        }

        String zoning = prop != null && prop.getZoning() != null
                        ? safeText(prop.getZoning(), "Not specified")
                        : "Not specified";

        String condition = prop != null && prop.getCondition() != null
                           ? HumanizeText.sentenceCaseWord(prop.getCondition())
                           : "Not specified";

        String structure = prop != null && prop.getStructureType() != null
                           ? HumanizeText.sentenceCaseWord(safeText(prop.getStructureType(), "Not specified"))
                           : "Not specified";

        String verified = prop != null && Boolean.TRUE.equals(prop.getVerified())
                          ? "Yes \u2013 records verified"
                          : "Not verified";

        String generatedBy = report.getGeneratedByEmail() != null
                             ? report.getGeneratedByEmail()
                             : "\u2014";

        r = addOverviewRow(sheet, sf, r, "Property Address",        address,     false);
        r = addOverviewRow(sheet, sf, r, "City / State / PIN",      location,    true);
        r = addOverviewRow(sheet, sf, r, "Property Type",           propType,    false);
        r = addOverviewRow(sheet, sf, r, "Area",                    area,        true);
        r = addOverviewRow(sheet, sf, r, "Estimated Market Value",  marketValue, false);
        r = addOverviewRow(sheet, sf, r, "Year Built",              yearBuilt,   true);
        r = addOverviewRow(sheet, sf, r, "Bedrooms / Bathrooms",    rooms,       false);
        r = addOverviewRow(sheet, sf, r, "Zoning",                  zoning,      true);
        r = addOverviewRow(sheet, sf, r, "Condition",               condition,   false);
        r = addOverviewRow(sheet, sf, r, "Structure Type",          structure,   true);
        r = addOverviewRow(sheet, sf, r, "Verified",                verified,    false);
        r = addOverviewRow(sheet, sf, r, "Generated By",            generatedBy, true);

        return r;
    }

    /**
     * Risk table now starts at column A (fixes floating-table bug).
     * Layout: A=Category, B=(empty), C=Weight, D=Score, E=Level, F=Source
     * Note: col B remains empty for consistent width with property table above.
     */
    private int buildRiskTableHeader(XSSFSheet sheet, ExcelStyleFactory sf, int rowIdx) {
        Row row = sheet.createRow(rowIdx);
        row.setHeight(RH_TABLE_HDR);

        Cell c0 = row.createCell(0);
        c0.setCellValue("Category");
        c0.setCellStyle(sf.tableHeader());

        // Col B — blank header cell but styled to match
        Cell c1 = row.createCell(1);
        c1.setCellStyle(sf.tableHeader());

        Cell c2 = row.createCell(2);
        c2.setCellValue("Weight");
        c2.setCellStyle(sf.tableHeaderCenter());

        Cell c3 = row.createCell(3);
        c3.setCellValue("Score");
        c3.setCellStyle(sf.tableHeaderCenter());

        Cell c4 = row.createCell(4);
        c4.setCellValue("Risk Level");
        c4.setCellStyle(sf.tableHeaderCenter());

        Cell c5 = row.createCell(5);
        c5.setCellValue("Data Source");
        c5.setCellStyle(sf.tableHeader());

        // Merge A+B for "Category" column header
        sheet.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, 0, 1));

        return rowIdx + 1;
    }

    private int buildRiskFactorRows(XSSFSheet sheet, ExcelStyleFactory sf, int startRow,
                                     RiskBreakdownDto breakdown) {
        if (breakdown == null || breakdown.getFactors() == null) return startRow;

        int r = startRow;
        int idx = 0;
        for (RiskFactorDto factor : breakdown.getFactors()) {
            boolean alt = (idx % 2 == 1);
            Row row = sheet.createRow(r);
            row.setHeight(RH_DATA);

            XSSFCellStyle plain = alt ? sf.dataAlt() : sf.dataRegular();

            String catName = displayNameForCategory(factor);
            Cell catCell = row.createCell(0);
            catCell.setCellValue(catName);
            catCell.setCellStyle(plain);

            // Col B — merged with A for category
            Cell catCell2 = row.createCell(1);
            catCell2.setCellStyle(plain);
            sheet.addMergedRegion(new CellRangeAddress(r, r, 0, 1));

            String weightStr = Math.round(factor.getWeight() * 100) + "%";
            Cell weightCell = row.createCell(2);
            weightCell.setCellValue(weightStr);
            weightCell.setCellStyle(sf.percentage());

            String levelName = factor.getLevel() != null ? factor.getLevel().name() : "LOW";
            double score = factor.getScore();
            Cell scoreCell = row.createCell(3);
            scoreCell.setCellValue(String.format("%.1f", score));
            scoreCell.setCellStyle(sf.scoreForLevel(levelName));

            String levelLabel = labelForLevel(levelName);
            Cell levelCell = row.createCell(4);
            levelCell.setCellValue(levelLabel);
            levelCell.setCellStyle(sf.riskForLevel(levelName));

            String source = humanizeSource(factor.getDataSource());
            Cell sourceCell = row.createCell(5);
            sourceCell.setCellValue(source);
            sourceCell.setCellStyle(plain);

            r++;
            idx++;
        }
        return r;
    }

    /**
     * Executive summary — ALWAYS renders a visible cell.
     * Tries in order:
     *   1. report.executiveSummary if present
     *   2. Auto-generated summary from breakdown data
     *   3. Fallback message
     */
    private int buildExecutiveSummary(XSSFSheet sheet, XSSFWorkbook wb, int startRow,
                                       DueDiligenceReportResponse report,
                                       RiskBreakdownDto breakdown,
                                       PropertyResponse prop) {
        String raw = report.getExecutiveSummary();
        log.info("[excel-export] Executive summary raw length: {}",
                raw != null ? raw.length() : "null");

        String summary;
        if (raw != null && !raw.isBlank()) {
            summary = HumanizeText.cleanNarrative(safeText(raw, ""));
        } else {
            // Auto-generate from breakdown
            summary = generateFallbackSummary(report, breakdown, prop);
        }

        // Ensure we always have content
        if (summary == null || summary.isBlank()) {
            summary = "Executive summary is not available for this report. "
                    + "Please regenerate the report or contact support.";
        }

        int lines       = (int) Math.ceil(summary.length() / 140.0);
        short rowHeight = (short) Math.max(RH_SUMMARY, lines * 280);

        Row row = sheet.createRow(startRow);
        row.setHeight(rowHeight);

        XSSFCellStyle summaryStyle = buildSummaryStyle(wb);

        Cell cell = row.createCell(0);
        cell.setCellValue(summary);
        cell.setCellStyle(summaryStyle);

        sheet.addMergedRegion(new CellRangeAddress(startRow, startRow, 0, S1_LAST_COL));

        for (int c = 1; c <= S1_LAST_COL; c++) {
            row.createCell(c).setCellStyle(summaryStyle);
        }

        return startRow + 1;
    }

    /**
     * Generates a professional executive summary from available data
     * when the report doesn't have one stored.
     */
    private String generateFallbackSummary(DueDiligenceReportResponse report,
                                            RiskBreakdownDto breakdown,
                                            PropertyResponse prop) {
        StringBuilder sb = new StringBuilder();

        String address = safeText(report.getPropertyAddress(), "the subject property");
        sb.append("This due diligence report presents a comprehensive risk assessment of ")
          .append(address).append(". ");

        if (breakdown != null) {
            double score = breakdown.getOverallScore();
            String level = breakdown.getOverallLevel() != null
                           ? labelForLevel(breakdown.getOverallLevel().name()).toLowerCase()
                           : "low";
            sb.append("The property has been evaluated across six risk categories and received ")
              .append("an overall risk score of ")
              .append(String.format("%.1f out of 100", score))
              .append(", indicating a ").append(level).append(" risk profile. ");

            // Highlight highest risk category
            if (breakdown.getFactors() != null && !breakdown.getFactors().isEmpty()) {
                RiskFactorDto highest = breakdown.getFactors().stream()
                        .max(Comparator.comparingDouble(RiskFactorDto::getScore))
                        .orElse(null);
                if (highest != null && highest.getScore() > 30) {
                    sb.append("The most significant risk area identified is ")
                      .append(displayNameForCategory(highest).toLowerCase())
                      .append(", scoring ").append(String.format("%.1f", highest.getScore()))
                      .append(". ");
                }
            }

            if (breakdown.isDataIncomplete()) {
                sb.append("Note that ").append(breakdown.getUnavailableProviderCount())
                  .append(" data provider(s) were unavailable during analysis; ")
                  .append("some scores are based on regional averages. ");
            }
        }

        sb.append("Detailed category analysis, recommendations, and data source coverage ")
          .append("are provided in the accompanying sheets of this workbook.");

        return HumanizeText.cleanNarrative(sb.toString());
    }

    private int buildDataQualityCallout(XSSFSheet sheet, ExcelStyleFactory sf, int startRow,
                                         RiskBreakdownDto breakdown) {
        int unavail = breakdown.getUnavailableProviderCount();
        String msg  = "\u26A0  Data Quality Notice \u2014 " + unavail
                      + " data provider" + (unavail == 1 ? "" : "s")
                      + " could not be reached during analysis. "
                      + "Scores for affected categories are estimated and may not reflect "
                      + "real-time conditions. Recommend re-running analysis when providers "
                      + "are available.";

        Row row = sheet.createRow(startRow);
        row.setHeight(RH_SUMMARY);

        Cell cell = row.createCell(0);
        cell.setCellValue(msg);
        cell.setCellStyle(sf.calloutNotice());

        sheet.addMergedRegion(new CellRangeAddress(startRow, startRow, 0, S1_LAST_COL));
        for (int c = 1; c <= S1_LAST_COL; c++) {
            row.createCell(c).setCellStyle(sf.calloutNotice());
        }

        return startRow + 1;
    }

    // =========================================================================
    // SHEET 2 — DETAILED ANALYSIS
    // =========================================================================

    private void buildSheet2(XSSFWorkbook wb, ExcelStyleFactory sf, PdfReportBundle bundle) {
        XSSFSheet sheet = wb.createSheet("Detailed Analysis");

        sheet.setColumnWidth(0, W2_NUM);
        sheet.setColumnWidth(1, W2_CAT);
        sheet.setColumnWidth(2, W2_SCORE);
        sheet.setColumnWidth(3, W2_LEVEL);
        sheet.setColumnWidth(4, W2_WEIGHT);
        sheet.setColumnWidth(5, W2_SOURCE);
        sheet.setColumnWidth(6, W2_ANALYSIS);
        sheet.setColumnWidth(7, W2_REC);

        RiskBreakdownDto breakdown = bundle.breakdown;
        int r = 0;

        r = addBanner(sheet, r, "RISK ANALYSIS & BREAKDOWN",
                sf.eyebrow(), RH_EYEBROW, 0, S2_LAST_COL);

        r = addBanner(sheet, r, "Detailed Category Analysis",
                sf.sheetTitle(), RH_BANNER, 0, S2_LAST_COL);

        String addr = safeText(bundle.report.getPropertyAddress(), "Not specified");
        r = addBanner(sheet, r, addr + "   \u2014   Sorted highest risk first",
                sf.sheetSubtitle(), RH_SUBTITLE, 0, S2_LAST_COL);

        r = addSpacer(sheet, r);
        r = buildDetailedTableHeader(sheet, sf, r);
        r = buildDetailedFactorRows(sheet, sf, r, breakdown);

        // BIGGER gap before checklist
        r = addBigSpacer(sheet, r);
        r = addBigSpacer(sheet, r);

        r = addSectionHeader(sheet, r,
                "  GENERAL DUE DILIGENCE CHECKLIST", sf.sectionHeaderDark(), 0, S2_LAST_COL);
        r = buildChecklist(sheet, sf, r);

        sheet.createFreezePane(0, 4);
    }

    private int buildDetailedTableHeader(XSSFSheet sheet, ExcelStyleFactory sf, int rowIdx) {
        Row row = sheet.createRow(rowIdx);
        row.setHeight(RH_TABLE_HDR);

        String[] headers = {"#", "Category", "Score", "Level", "Weight", "Data Source",
                             "Analysis", "Recommendation"};
        XSSFCellStyle[] styles = {
            sf.tableHeaderCenter(), sf.tableHeader(),     sf.tableHeaderCenter(),
            sf.tableHeaderCenter(), sf.tableHeaderCenter(), sf.tableHeader(),
            sf.tableHeader(),       sf.tableHeader()
        };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(styles[i]);
        }
        return rowIdx + 1;
    }

    private int buildDetailedFactorRows(XSSFSheet sheet, ExcelStyleFactory sf, int startRow,
                                         RiskBreakdownDto breakdown) {
        if (breakdown == null || breakdown.getFactors() == null) return startRow;

        List<RiskFactorDto> sorted = breakdown.getFactors().stream()
                .sorted(Comparator.comparingDouble((RiskFactorDto f) -> f.getScore()).reversed())
                .toList();

        int r   = startRow;
        int idx = 0;

        for (RiskFactorDto factor : sorted) {
            idx++;
            boolean alt      = (idx % 2 == 0);
            String levelName = factor.getLevel() != null ? factor.getLevel().name() : "LOW";

            String catName   = displayNameForCategory(factor);
            double score     = factor.getScore();
            String levelLbl  = labelForLevel(levelName);
            String weight    = Math.round(factor.getWeight() * 100) + "%";
            String source    = humanizeSource(factor.getDataSource());
            String analysis  = factor.getExplanation() != null && !factor.getExplanation().isBlank()
                               ? HumanizeText.cleanNarrative(safeText(factor.getExplanation(), ""))
                               : "No analysis available for this category.";
            String rec       = factor.getRecommendation() != null && !factor.getRecommendation().isBlank()
                               ? HumanizeText.cleanNarrative(safeText(factor.getRecommendation(), ""))
                               : "No specific recommendation available.";

            // Taller minimum + more per-line height
            int maxChars  = Math.max(analysis.length(), rec.length());
            int lines     = (int) Math.ceil(maxChars / 55.0);   // tighter width estimate
            short height  = (short) Math.max(900, lines * 340); // was 600 / 320

            Row row = sheet.createRow(r);
            row.setHeight(height);

            XSSFCellStyle plain  = alt ? sf.dataAlt()       : sf.dataRegular();
            XSSFCellStyle center = alt ? sf.dataAltCenter() : sf.dataRegularCenter();
            XSSFCellStyle wrap   = alt ? sf.dataAltWrap()   : sf.dataWrap();

            Cell numCell = row.createCell(0);
            numCell.setCellValue(idx);
            numCell.setCellStyle(center);

            Cell catCell = row.createCell(1);
            catCell.setCellValue(catName);
            catCell.setCellStyle(sf.dataBold());

            Cell scoreCell = row.createCell(2);
            scoreCell.setCellValue(String.format("%.1f", score));
            scoreCell.setCellStyle(sf.scoreForLevel(levelName));

            Cell levelCell = row.createCell(3);
            levelCell.setCellValue(levelLbl);
            levelCell.setCellStyle(sf.riskForLevel(levelName));

            Cell weightCell = row.createCell(4);
            weightCell.setCellValue(weight);
            weightCell.setCellStyle(sf.percentage());

            Cell srcCell = row.createCell(5);
            srcCell.setCellValue(source);
            srcCell.setCellStyle(plain);

            Cell analysisCell = row.createCell(6);
            analysisCell.setCellValue(analysis);
            analysisCell.setCellStyle(wrap);

            Cell recCell = row.createCell(7);
            recCell.setCellValue(rec);
            recCell.setCellStyle(wrap);

            r++;
        }
        return r;
    }

    private int buildChecklist(XSSFSheet sheet, ExcelStyleFactory sf, int startRow) {
        int r = startRow;
        for (int i = 0; i < CHECKLIST.length; i++) {
            boolean alt = (i % 2 == 1);
            Row row = sheet.createRow(r);
            row.setHeight(RH_DATA);

            Cell chk = row.createCell(0);
            chk.setCellValue("\u2610");
            chk.setCellStyle(alt ? sf.dataAltCenter() : sf.dataRegularCenter());

            Cell txt = row.createCell(1);
            txt.setCellValue(CHECKLIST[i]);
            txt.setCellStyle(alt ? sf.dataAlt() : sf.dataRegular());

            sheet.addMergedRegion(new CellRangeAddress(r, r, 1, S2_LAST_COL));
            for (int c = 2; c <= S2_LAST_COL; c++) {
                row.createCell(c).setCellStyle(alt ? sf.dataAlt() : sf.dataRegular());
            }
            r++;
        }
        return r;
    }

    // =========================================================================
    // SHEET 3 — DATA SOURCES
    // =========================================================================

    private void buildSheet3(XSSFWorkbook wb, ExcelStyleFactory sf, PdfReportBundle bundle) {
        XSSFSheet sheet = wb.createSheet("Data Sources");

        sheet.setColumnWidth(0, W3_MODULE);
        sheet.setColumnWidth(1, W3_STATUS);
        sheet.setColumnWidth(2, W3_VALUE);
        sheet.setColumnWidth(3, W3_NOTE);

        RiskBreakdownDto           breakdown = bundle.breakdown;

        int r = 0;

        r = addBanner(sheet, r, "DATA SOURCE COVERAGE",
                sf.eyebrow(), RH_EYEBROW, 0, S3_LAST_COL);

        r = addBanner(sheet, r, "Provider & Module Coverage Report",
                sf.sheetTitle(), RH_BANNER, 0, S3_LAST_COL);

        String addr = safeText(bundle.report.getPropertyAddress(), "Not specified");
        r = addBanner(sheet, r, addr, sf.sheetSubtitle(), RH_SUBTITLE, 0, S3_LAST_COL);

        r = addSpacer(sheet, r);

        Row hdrRow = sheet.createRow(r);
        hdrRow.setHeight(RH_TABLE_HDR);
        String[] hdrs = {"Data Module", "Status", "Value / Reading", "Coverage Note"};
        XSSFCellStyle[] hdrStyles = {
            sf.tableHeader(), sf.tableHeaderCenter(), sf.tableHeader(), sf.tableHeader()
        };
        for (int i = 0; i < hdrs.length; i++) {
            Cell c = hdrRow.createCell(i);
            c.setCellValue(hdrs[i]);
            c.setCellStyle(hdrStyles[i]);
        }
        r++;

        r = buildDataSourceRows(sheet, sf, r, breakdown);

        r = addBigSpacer(sheet, r);
        r = addSectionHeader(sheet, r,
                "  COVERAGE SUMMARY", sf.sectionHeaderDark(), 0, S3_LAST_COL);
        r = buildCoverageSummary(sheet, sf, r, breakdown);

        sheet.createFreezePane(0, 4);
    }

    private int buildDataSourceRows(XSSFSheet sheet, ExcelStyleFactory sf, int startRow,
                                     RiskBreakdownDto breakdown) {
        int r   = startRow;
        int idx = 0;

        if (breakdown != null && breakdown.getFactors() != null) {
            for (RiskFactorDto factor : breakdown.getFactors()) {
                boolean alt = (idx % 2 == 1);

                String module = displayNameForCategory(factor) + " Module";
                String source = humanizeSource(factor.getDataSource());
                String value  = "Score: " + String.format("%.1f", factor.getScore());
                String note   = buildDataSourceNote(factor);

                // Simplified status chip: only red if truly no data, else neutral emerald
                XSSFCellStyle statusStyle = isUnavailable(factor.getDataSource())
                                            ? sf.statusUnavailable()
                                            : sf.statusComplete();

                r = addDataRow(sheet, sf, r, alt, module, source, value, note, statusStyle);
                idx++;
            }
        }

        return r;
    }

    /** True if data source represents "no data available". */
    private boolean isUnavailable(String source) {
        if (source == null) return true;
        String u = source.toUpperCase();
        return u.contains("NO_DATA") || u.contains("UNAVAILABLE") || u.equals("NONE");
    }

    private String buildDataSourceNote(RiskFactorDto factor) {
        if (factor.isDataUncertain()) {
            return "Data uncertain \u2014 estimate used";
        }
        if (isUnavailable(factor.getDataSource())) {
            return "Provider unavailable \u2014 region-specific data pending";
        }
        String catName = displayNameForCategory(factor);
        return catName + " assessed via " + humanizeSource(factor.getDataSource());
    }

    private int addDataRow(XSSFSheet sheet, ExcelStyleFactory sf, int rowIdx,
                            boolean alt, String module, String status,
                            String value, String note, XSSFCellStyle statusStyle) {
        Row row = sheet.createRow(rowIdx);
        row.setHeight(RH_DATA);

        XSSFCellStyle plain = alt ? sf.dataAlt() : sf.dataRegular();

        Cell c0 = row.createCell(0);
        c0.setCellValue(module);
        c0.setCellStyle(sf.dataBold());

        Cell c1 = row.createCell(1);
        c1.setCellValue(status);
        c1.setCellStyle(statusStyle);

        Cell c2 = row.createCell(2);
        c2.setCellValue(value);
        c2.setCellStyle(plain);

        // Coverage note — navy body text (was emerald which was confusing)
        Cell c3 = row.createCell(3);
        c3.setCellValue(note);
        c3.setCellStyle(plain);

        return rowIdx + 1;
    }

    private int buildCoverageSummary(XSSFSheet sheet, ExcelStyleFactory sf, int startRow,
                                      RiskBreakdownDto breakdown) {
        int r = startRow;
        if (breakdown == null) return r;

        int total   = breakdown.getFactors() != null ? breakdown.getFactors().size() : 6;
        int unavail = breakdown.getUnavailableProviderCount();
        int avail   = total - unavail;
        int pct     = total > 0 ? (int) Math.round((avail * 100.0) / total) : 0;

        r = addOverviewRow(sheet, sf, r, "Total Categories Assessed",
                String.valueOf(total), false);
        r = addOverviewRow(sheet, sf, r, "Data Providers Available",
                String.valueOf(avail), true);
        r = addOverviewRow(sheet, sf, r, "Data Providers Unavailable",
                String.valueOf(unavail), false);
        r = addOverviewRow(sheet, sf, r, "Overall Data Coverage",
                pct + "% of categories have live data", true);
        r = addOverviewRow(sheet, sf, r, "Data Complete",
                breakdown.isDataIncomplete() ? "No \u2013 some providers offline" : "Yes", false);

        return r;
    }

    // =========================================================================
    // SHARED ROW BUILDERS
    // =========================================================================

    private int addBanner(XSSFSheet sheet, int rowIdx,
                           String text, XSSFCellStyle style,
                           short height, int firstCol, int lastCol) {
        Row row = sheet.createRow(rowIdx);
        row.setHeight(height);

        Cell cell = row.createCell(firstCol);
        cell.setCellValue(text);
        cell.setCellStyle(style);

        sheet.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, firstCol, lastCol));
        for (int c = firstCol + 1; c <= lastCol; c++) {
            row.createCell(c).setCellStyle(style);
        }
        return rowIdx + 1;
    }

    private int addSectionHeader(XSSFSheet sheet, int rowIdx,
                                  String text, XSSFCellStyle style,
                                  int firstCol, int lastCol) {
        Row row = sheet.createRow(rowIdx);
        row.setHeight(RH_SECTION);

        Cell cell = row.createCell(firstCol);
        cell.setCellValue(text);
        cell.setCellStyle(style);

        sheet.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, firstCol, lastCol));
        for (int c = firstCol + 1; c <= lastCol; c++) {
            row.createCell(c).setCellStyle(style);
        }
        return rowIdx + 1;
    }

    private int addSpacer(XSSFSheet sheet, int rowIdx) {
        Row row = sheet.createRow(rowIdx);
        row.setHeight(RH_SPACER);
        return rowIdx + 1;
    }

    /** Larger vertical spacer for visual section breaks. */
    private int addBigSpacer(XSSFSheet sheet, int rowIdx) {
        Row row = sheet.createRow(rowIdx);
        row.setHeight(RH_BIG_SPACE);
        return rowIdx + 1;
    }

    private int addOverviewRow(XSSFSheet sheet, ExcelStyleFactory sf, int rowIdx,
                                String label, String value, boolean alt) {
        Row row = sheet.createRow(rowIdx);
        row.setHeight(RH_DATA);

        Cell c0 = row.createCell(0);
        c0.setCellValue(label);
        c0.setCellStyle(sf.labelBold());

        Cell c1 = row.createCell(1);
        c1.setCellValue(safeText(value, "Not specified"));
        c1.setCellStyle(alt ? sf.dataAlt() : sf.labelValue());

        return rowIdx + 1;
    }

    // =========================================================================
    // STYLE HELPERS
    // =========================================================================

    private XSSFCellStyle buildKpiValueStyle(XSSFWorkbook wb, ExcelStyleFactory sf,
                                              String bgHex, String textHex, int fontSize) {
        XSSFCellStyle style = wb.createCellStyle();
        style.cloneStyleFrom(sf.kpiValue());
        style.setFillForegroundColor(sf.hexToXSSFColor(bgHex));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        XSSFFont font = wb.createFont();
        font.setFontName("Calibri");
        font.setFontHeightInPoints((short) fontSize);
        font.setBold(true);
        font.setColor(sf.hexToXSSFColor(textHex));
        style.setFont(font);

        return style;
    }

    private XSSFCellStyle blendKpiBg(XSSFWorkbook wb, XSSFCellStyle source,
                                      ExcelStyleFactory sf, String bgHex) {
        XSSFCellStyle style = wb.createCellStyle();
        style.cloneStyleFrom(source);
        style.setFillForegroundColor(sf.hexToXSSFColor(bgHex));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private XSSFCellStyle buildSummaryStyle(XSSFWorkbook wb) {
        XSSFCellStyle style = wb.createCellStyle();
        XSSFFont font = wb.createFont();
        font.setFontName("Calibri");
        font.setFontHeightInPoints((short) 10);
        font.setColor(new XSSFColor(
                new byte[]{(byte) 15, (byte) 23, (byte) 42}, null));
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(
                new byte[]{(byte) 248, (byte) 250, (byte) 252}, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setWrapText(true);
        style.setVerticalAlignment(VerticalAlignment.TOP);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setIndention((short) 1);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBottomBorderColor(new XSSFColor(
                new byte[]{(byte) 226, (byte) 232, (byte) 240}, null));
        return style;
    }

    private String levelColorHex(String levelName) {
        if (levelName == null) return ExcelStyleFactory.HEX_SLATE_500;
        return switch (levelName.toUpperCase()) {
            case "LOW"      -> ExcelStyleFactory.HEX_LOW_TEXT;
            case "MEDIUM"   -> ExcelStyleFactory.HEX_MED_TEXT;
            case "HIGH"     -> ExcelStyleFactory.HEX_HIGH_TEXT;
            case "CRITICAL" -> ExcelStyleFactory.HEX_CRIT_TEXT;
            default         -> ExcelStyleFactory.HEX_SLATE_500;
        };
    }

    // =========================================================================
    // DOMAIN HELPERS
    // =========================================================================

    private String displayNameForCategory(RiskFactorDto factor) {
        if (factor == null || factor.getCategory() == null) return "\u2014";
        String raw = factor.getCategory().name();
        return switch (raw) {
            case "FLOOD"         -> "Flood Risk";
            case "LEGAL"         -> "Legal Risk";
            case "TAX"           -> "Tax Risk";
            case "ZONING"        -> "Zoning Risk";
            case "ENVIRONMENTAL" -> "Environmental Risk";
            case "MARKET"        -> "Market Risk";
            default              -> HumanizeText.enumLabel(raw);
        };
    }

    private String labelForLevel(String levelName) {
        if (levelName == null || levelName.isBlank()) return "\u2014";
        return switch (levelName.toUpperCase()) {
            case "LOW"      -> "Low";
            case "MEDIUM"   -> "Medium";
            case "HIGH"     -> "High";
            case "CRITICAL" -> "Critical";
            default         -> HumanizeText.enumLabel(levelName);
        };
    }

    /**
     * Humanizes data source strings with special-case fixes.
     * Handles lowercase suffixes like "PROPERTY_DB" → "Property Database"
     * that the generic HumanizeText.enumLabel() would produce as "Property db".
     */
    private String humanizeSource(String source) {
        if (source == null || source.isBlank()) return "Unavailable";
        String raw = source.trim();

        // Special cases first
        switch (raw.toUpperCase()) {
            case "PROPERTY_DB": return "Property Database";
            case "NO_DATA":     return "No data available";
            case "MOCK":        return "Simulated data";
            case "LIVE":        return "Live provider";
            case "NDMA":        return "NDMA";
            case "CWC":         return "CWC";
            default:
                String base = HumanizeText.enumLabel(raw);
                // Fix trailing "db" → "Database"
                if (base.endsWith(" db")) {
                    base = base.substring(0, base.length() - 3) + " Database";
                }
                // Fix trailing "api" → "API"
                if (base.endsWith(" api")) {
                    base = base.substring(0, base.length() - 4) + " API";
                }
                return base;
        }
    }

    // =========================================================================
    // UTILITY
    // =========================================================================

    private String safeText(String input, String fallback) {
        if (input == null || input.isBlank()) return fallback;
        for (char c : input.toCharArray()) {
            if (c > '\u024F') return fallback;
        }
        return input.trim();
    }
}