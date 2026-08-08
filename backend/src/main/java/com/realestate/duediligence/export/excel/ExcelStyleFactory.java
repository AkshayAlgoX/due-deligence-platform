package com.realestate.duediligence.export.excel;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*;

/**
 * ExcelStyleFactory — centralised style/font/color registry for the premium
 * Due Diligence Excel workbook.
 *
 * Design system mirror of PdfDesignSystem.java (Session 25).
 * All colours are taken from the locked palette used in the PDF export.
 *
 * Usage pattern:
 *   ExcelStyleFactory sf = new ExcelStyleFactory(workbook);
 *   cell.setCellStyle(sf.tableHeader());
 *
 * IMPORTANT: POI enforces a hard limit of 64,000 cell styles per workbook.
 * Every method here caches its result on first call — do NOT call createStyle()
 * repeatedly in a loop; always use the accessor methods below.
 */
public class ExcelStyleFactory {

    // ─── Brand palette (matches PdfDesignSystem exactly) ──────────────────────

    // Primary
    public static final String HEX_EMERALD      = "10B981"; // brand green
    public static final String HEX_EMERALD_DARK = "059669"; // darker green for borders
    public static final String HEX_NAVY_900     = "0F172A"; // primary text / dark bg
    public static final String HEX_NAVY_700     = "1E293B"; // section headers bg
    public static final String HEX_SLATE_500    = "64748B"; // muted / secondary text
    public static final String HEX_SLATE_200    = "E2E8F0"; // card border / divider
    public static final String HEX_SLATE_50     = "F8FAFC"; // card background (alt rows)
    public static final String HEX_WHITE        = "FFFFFF";

    // Risk zones — match PDF exactly
    public static final String HEX_LOW_BG       = "F0FDF4";
    public static final String HEX_LOW_TEXT     = "16A34A";
    public static final String HEX_LOW_BORDER   = "BBF7D0";

    public static final String HEX_MED_BG       = "FEF3C7";
    public static final String HEX_MED_TEXT     = "D97706";
    public static final String HEX_MED_BORDER   = "FDE68A";

    public static final String HEX_HIGH_BG      = "FEE2E2";
    public static final String HEX_HIGH_TEXT    = "DC2626";
    public static final String HEX_HIGH_BORDER  = "FECACA";

    public static final String HEX_CRIT_BG      = "FECACA";
    public static final String HEX_CRIT_TEXT    = "991B1B";
    public static final String HEX_CRIT_BORDER  = "F87171";

    // KPI card accent backgrounds
    public static final String HEX_KPI_SCORE_BG  = "ECFDF5"; // very light emerald
    public static final String HEX_KPI_LEVEL_BG  = "F0F9FF"; // very light blue
    public static final String HEX_KPI_STATUS_BG = "F0FDF4"; // same as low risk bg
    public static final String HEX_KPI_DATE_BG   = "F8FAFC"; // slate 50

    // Checklist / callout
    public static final String HEX_CALLOUT_BG    = "FFFBEB"; // amber 50
    public static final String HEX_CALLOUT_TEXT  = "92400E"; // amber 800

    // ─── Workbook reference ────────────────────────────────────────────────────

    private final XSSFWorkbook wb;

    // ─── Cached styles (lazily initialised) ───────────────────────────────────

    // Sheet title / eyebrow
    private XSSFCellStyle _eyebrowStyle;
    private XSSFCellStyle _sheetTitleStyle;
    private XSSFCellStyle _sheetSubtitleStyle;

    // Section dividers
    private XSSFCellStyle _sectionHeaderDark;   // navy bg, white bold text
    private XSSFCellStyle _sectionHeaderEmerald; // emerald bg, white bold text

    // Table headers
    private XSSFCellStyle _tableHeader;          // emerald bg, white 10pt bold
    private XSSFCellStyle _tableHeaderCenter;    // same + centered

    // KPI cards
    private XSSFCellStyle _kpiLabel;             // muted, 8pt, centered
    private XSSFCellStyle _kpiValue;             // navy, 18pt bold, centered
    private XSSFCellStyle _kpiValueEmerald;      // emerald, 18pt bold, centered
    private XSSFCellStyle _kpiScoreBg;           // light emerald bg card
    private XSSFCellStyle _kpiLevelBg;
    private XSSFCellStyle _kpiStatusBg;
    private XSSFCellStyle _kpiDateBg;

    // Data rows
    private XSSFCellStyle _dataRegular;          // 10pt regular, left aligned
    private XSSFCellStyle _dataRegularCenter;    // 10pt regular, center aligned
    private XSSFCellStyle _dataAlt;              // slate-50 bg alt row
    private XSSFCellStyle _dataAltCenter;
    private XSSFCellStyle _dataBold;             // 10pt bold
    private XSSFCellStyle _dataBoldCenter;
    private XSSFCellStyle _dataMuted;            // slate-500 color, 9pt
    private XSSFCellStyle _dataMutedCenter;
    private XSSFCellStyle _dataWrap;             // wrap text, 10pt, top-aligned
    private XSSFCellStyle _dataAltWrap;          // wrap + alt bg

    // Label column (left side in 2-column overview tables)
    private XSSFCellStyle _labelBold;            // 9.5pt bold, slate-50 bg
    private XSSFCellStyle _labelValue;           // 9.5pt regular

    // Risk level cells
    private XSSFCellStyle _riskLow;
    private XSSFCellStyle _riskLowCenter;
    private XSSFCellStyle _riskMedium;
    private XSSFCellStyle _riskMediumCenter;
    private XSSFCellStyle _riskHigh;
    private XSSFCellStyle _riskHighCenter;
    private XSSFCellStyle _riskCritical;
    private XSSFCellStyle _riskCriticalCenter;

    // Score cells (bold, risk-colored text, no bg tint)
    private XSSFCellStyle _scoreLow;
    private XSSFCellStyle _scoreMedium;
    private XSSFCellStyle _scoreHigh;
    private XSSFCellStyle _scoreCritical;

    // Currency / number cells
    private XSSFCellStyle _currency;             // ₹ compact string, right-aligned bold
    private XSSFCellStyle _percentage;           // right-aligned, muted
    private XSSFCellStyle _numberBold;           // right-aligned bold

    // Callout / notice row
    private XSSFCellStyle _calloutNotice;        // amber bg, amber dark text, italic

    // Status chips (text approximation — Excel can't do real pills)
    private XSSFCellStyle _statusComplete;
    private XSSFCellStyle _statusPending;
    private XSSFCellStyle _statusUnavailable;

    // ─── Constructor ──────────────────────────────────────────────────────────

    public ExcelStyleFactory(XSSFWorkbook workbook) {
        this.wb = workbook;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC ACCESSORS — call these from ExcelExportServiceImpl
    // ═══════════════════════════════════════════════════════════════════════════

    /** "DUE DILIGENCE REPORT" — emerald bg, white 8pt bold caps eyebrow */
    public XSSFCellStyle eyebrow() {
        if (_eyebrowStyle == null) {
            _eyebrowStyle = base();
            applyFill(_eyebrowStyle, HEX_EMERALD);
            applyFont(_eyebrowStyle, HEX_WHITE, 8, true, false);
            _eyebrowStyle.setAlignment(HorizontalAlignment.LEFT);
            _eyebrowStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            applyPadding(_eyebrowStyle);
        }
        return _eyebrowStyle;
    }

    /** "Property Risk Assessment" — navy bg, white 18pt bold main title */
    public XSSFCellStyle sheetTitle() {
        if (_sheetTitleStyle == null) {
            _sheetTitleStyle = base();
            applyFill(_sheetTitleStyle, HEX_NAVY_900);
            applyFont(_sheetTitleStyle, HEX_WHITE, 18, true, false);
            _sheetTitleStyle.setAlignment(HorizontalAlignment.LEFT);
            _sheetTitleStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            applyPadding(_sheetTitleStyle);
        }
        return _sheetTitleStyle;
    }

    /** "{address} · Report #{id} · Version {v}" — slate-50 bg, muted 10pt */
    public XSSFCellStyle sheetSubtitle() {
        if (_sheetSubtitleStyle == null) {
            _sheetSubtitleStyle = base();
            applyFill(_sheetSubtitleStyle, HEX_SLATE_50);
            applyFont(_sheetSubtitleStyle, HEX_SLATE_500, 10, false, false);
            _sheetSubtitleStyle.setAlignment(HorizontalAlignment.LEFT);
            _sheetSubtitleStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_sheetSubtitleStyle, HEX_SLATE_200);
            applyPadding(_sheetSubtitleStyle);
        }
        return _sheetSubtitleStyle;
    }

    /** Section divider — navy-700 bg, white 11pt bold, ALL CAPS */
    public XSSFCellStyle sectionHeaderDark() {
        if (_sectionHeaderDark == null) {
            _sectionHeaderDark = base();
            applyFill(_sectionHeaderDark, HEX_NAVY_700);
            applyFont(_sectionHeaderDark, HEX_WHITE, 11, true, false);
            _sectionHeaderDark.setAlignment(HorizontalAlignment.LEFT);
            _sectionHeaderDark.setVerticalAlignment(VerticalAlignment.CENTER);
            applyPadding(_sectionHeaderDark);
        }
        return _sectionHeaderDark;
    }

    /** Section divider — emerald bg, white 11pt bold */
    public XSSFCellStyle sectionHeaderEmerald() {
        if (_sectionHeaderEmerald == null) {
            _sectionHeaderEmerald = base();
            applyFill(_sectionHeaderEmerald, HEX_EMERALD);
            applyFont(_sectionHeaderEmerald, HEX_WHITE, 11, true, false);
            _sectionHeaderEmerald.setAlignment(HorizontalAlignment.LEFT);
            _sectionHeaderEmerald.setVerticalAlignment(VerticalAlignment.CENTER);
            applyPadding(_sectionHeaderEmerald);
        }
        return _sectionHeaderEmerald;
    }

    /** Table column headers — emerald bg, white 10pt bold */
    public XSSFCellStyle tableHeader() {
        if (_tableHeader == null) {
            _tableHeader = base();
            applyFill(_tableHeader, HEX_EMERALD);
            applyFont(_tableHeader, HEX_WHITE, 10, true, false);
            _tableHeader.setAlignment(HorizontalAlignment.LEFT);
            _tableHeader.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_tableHeader, HEX_EMERALD_DARK);
            applyPadding(_tableHeader);
        }
        return _tableHeader;
    }

    /** Table column headers — same as tableHeader() but centered */
    public XSSFCellStyle tableHeaderCenter() {
        if (_tableHeaderCenter == null) {
            _tableHeaderCenter = base();
            applyFill(_tableHeaderCenter, HEX_EMERALD);
            applyFont(_tableHeaderCenter, HEX_WHITE, 10, true, false);
            _tableHeaderCenter.setAlignment(HorizontalAlignment.CENTER);
            _tableHeaderCenter.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_tableHeaderCenter, HEX_EMERALD_DARK);
            applyPadding(_tableHeaderCenter);
        }
        return _tableHeaderCenter;
    }

    // ── KPI card styles ────────────────────────────────────────────────────────

    /** KPI eyebrow label — 8pt bold, muted slate, centered */
        public XSSFCellStyle kpiLabel() {
        if (_kpiLabel == null) {
            _kpiLabel = base();
            applyFont(_kpiLabel, HEX_SLATE_500, 9, true, false);
            _kpiLabel.setAlignment(HorizontalAlignment.CENTER);
            _kpiLabel.setVerticalAlignment(VerticalAlignment.BOTTOM);
        }
        return _kpiLabel;
    }

    /** KPI value — 18pt bold, navy, centered */
    public XSSFCellStyle kpiValue() {
        if (_kpiValue == null) {
            _kpiValue = base();
            applyFont(_kpiValue, HEX_NAVY_900, 18, true, false);
            _kpiValue.setAlignment(HorizontalAlignment.CENTER);
            _kpiValue.setVerticalAlignment(VerticalAlignment.CENTER);
        }
        return _kpiValue;
    }

    /** KPI value — 18pt bold, emerald, centered (used for score) */
    public XSSFCellStyle kpiValueEmerald() {
        if (_kpiValueEmerald == null) {
            _kpiValueEmerald = base();
            applyFont(_kpiValueEmerald, HEX_EMERALD, 18, true, false);
            _kpiValueEmerald.setAlignment(HorizontalAlignment.CENTER);
            _kpiValueEmerald.setVerticalAlignment(VerticalAlignment.CENTER);
        }
        return _kpiValueEmerald;
    }

    /** KPI card background — score card (light emerald) */
    public XSSFCellStyle kpiScoreBg() {
        if (_kpiScoreBg == null) {
            _kpiScoreBg = base();
            applyFill(_kpiScoreBg, HEX_KPI_SCORE_BG);
            applyBorderFull(_kpiScoreBg, HEX_LOW_BORDER);
        }
        return _kpiScoreBg;
    }

    /** KPI card background — level card (light blue) */
    public XSSFCellStyle kpiLevelBg() {
        if (_kpiLevelBg == null) {
            _kpiLevelBg = base();
            applyFill(_kpiLevelBg, HEX_KPI_LEVEL_BG);
            applyBorderFull(_kpiLevelBg, HEX_SLATE_200);
        }
        return _kpiLevelBg;
    }

    /** KPI card background — status card */
    public XSSFCellStyle kpiStatusBg() {
        if (_kpiStatusBg == null) {
            _kpiStatusBg = base();
            applyFill(_kpiStatusBg, HEX_KPI_STATUS_BG);
            applyBorderFull(_kpiStatusBg, HEX_LOW_BORDER);
        }
        return _kpiStatusBg;
    }

    /** KPI card background — date card (neutral slate-50) */
    public XSSFCellStyle kpiDateBg() {
        if (_kpiDateBg == null) {
            _kpiDateBg = base();
            applyFill(_kpiDateBg, HEX_KPI_DATE_BG);
            applyBorderFull(_kpiDateBg, HEX_SLATE_200);
        }
        return _kpiDateBg;
    }

    // ── Data row styles ────────────────────────────────────────────────────────

    /** Standard data row — white bg, 10pt regular, left aligned */
    public XSSFCellStyle dataRegular() {
        if (_dataRegular == null) {
            _dataRegular = base();
            applyFont(_dataRegular, HEX_NAVY_900, 10, false, false);
            _dataRegular.setAlignment(HorizontalAlignment.LEFT);
            _dataRegular.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_dataRegular, HEX_SLATE_200);
        }
        return _dataRegular;
    }

    /** Standard data row — centered variant */
    public XSSFCellStyle dataRegularCenter() {
        if (_dataRegularCenter == null) {
            _dataRegularCenter = base();
            applyFont(_dataRegularCenter, HEX_NAVY_900, 10, false, false);
            _dataRegularCenter.setAlignment(HorizontalAlignment.CENTER);
            _dataRegularCenter.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_dataRegularCenter, HEX_SLATE_200);
        }
        return _dataRegularCenter;
    }

    /** Alternating row — slate-50 bg, 10pt regular */
    public XSSFCellStyle dataAlt() {
        if (_dataAlt == null) {
            _dataAlt = base();
            applyFill(_dataAlt, HEX_SLATE_50);
            applyFont(_dataAlt, HEX_NAVY_900, 10, false, false);
            _dataAlt.setAlignment(HorizontalAlignment.LEFT);
            _dataAlt.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_dataAlt, HEX_SLATE_200);
        }
        return _dataAlt;
    }

    /** Alternating row — centered variant */
    public XSSFCellStyle dataAltCenter() {
        if (_dataAltCenter == null) {
            _dataAltCenter = base();
            applyFill(_dataAltCenter, HEX_SLATE_50);
            applyFont(_dataAltCenter, HEX_NAVY_900, 10, false, false);
            _dataAltCenter.setAlignment(HorizontalAlignment.CENTER);
            _dataAltCenter.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_dataAltCenter, HEX_SLATE_200);
        }
        return _dataAltCenter;
    }

    /** Bold data cell — 10pt bold, navy */
    public XSSFCellStyle dataBold() {
        if (_dataBold == null) {
            _dataBold = base();
            applyFont(_dataBold, HEX_NAVY_900, 10, true, false);
            _dataBold.setAlignment(HorizontalAlignment.LEFT);
            _dataBold.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_dataBold, HEX_SLATE_200);
        }
        return _dataBold;
    }

    /** Bold data cell — centered variant */
    public XSSFCellStyle dataBoldCenter() {
        if (_dataBoldCenter == null) {
            _dataBoldCenter = base();
            applyFont(_dataBoldCenter, HEX_NAVY_900, 10, true, false);
            _dataBoldCenter.setAlignment(HorizontalAlignment.CENTER);
            _dataBoldCenter.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_dataBoldCenter, HEX_SLATE_200);
        }
        return _dataBoldCenter;
    }

    /** Muted secondary text — slate-500, 9pt regular */
    public XSSFCellStyle dataMuted() {
        if (_dataMuted == null) {
            _dataMuted = base();
            applyFont(_dataMuted, HEX_SLATE_500, 9, false, false);
            _dataMuted.setAlignment(HorizontalAlignment.LEFT);
            _dataMuted.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_dataMuted, HEX_SLATE_200);
        }
        return _dataMuted;
    }

    /** Muted secondary text — centered variant */
    public XSSFCellStyle dataMutedCenter() {
        if (_dataMutedCenter == null) {
            _dataMutedCenter = base();
            applyFont(_dataMutedCenter, HEX_SLATE_500, 9, false, false);
            _dataMutedCenter.setAlignment(HorizontalAlignment.CENTER);
            _dataMutedCenter.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_dataMutedCenter, HEX_SLATE_200);
        }
        return _dataMutedCenter;
    }

    /** Wrap-text cell for long narrative columns (Analysis / Recommendation) */
    public XSSFCellStyle dataWrap() {
        if (_dataWrap == null) {
            _dataWrap = base();
            applyFont(_dataWrap, HEX_NAVY_900, 10, false, false);
            _dataWrap.setAlignment(HorizontalAlignment.LEFT);
            _dataWrap.setVerticalAlignment(VerticalAlignment.TOP);
            _dataWrap.setWrapText(true);
            applyBorderBottom(_dataWrap, HEX_SLATE_200);
        }
        return _dataWrap;
    }

    /** Wrap-text cell — alternating row variant */
    public XSSFCellStyle dataAltWrap() {
        if (_dataAltWrap == null) {
            _dataAltWrap = base();
            applyFill(_dataAltWrap, HEX_SLATE_50);
            applyFont(_dataAltWrap, HEX_NAVY_900, 10, false, false);
            _dataAltWrap.setAlignment(HorizontalAlignment.LEFT);
            _dataAltWrap.setVerticalAlignment(VerticalAlignment.TOP);
            _dataAltWrap.setWrapText(true);
            applyBorderBottom(_dataAltWrap, HEX_SLATE_200);
        }
        return _dataAltWrap;
    }

    /** Overview label column — slate-50 bg, 9.5pt bold */
    public XSSFCellStyle labelBold() {
        if (_labelBold == null) {
            _labelBold = base();
            applyFill(_labelBold, HEX_SLATE_50);
            applyFont(_labelBold, HEX_NAVY_900, 10, true, false);
            _labelBold.setAlignment(HorizontalAlignment.LEFT);
            _labelBold.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_labelBold, HEX_SLATE_200);
            applyPadding(_labelBold);
        }
        return _labelBold;
    }

    /** Overview value column — white bg, 10pt regular */
    public XSSFCellStyle labelValue() {
        if (_labelValue == null) {
            _labelValue = base();
            applyFont(_labelValue, HEX_NAVY_900, 10, false, false);
            _labelValue.setAlignment(HorizontalAlignment.LEFT);
            _labelValue.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_labelValue, HEX_SLATE_200);
            applyPadding(_labelValue);
        }
        return _labelValue;
    }

    // ── Risk level cells ───────────────────────────────────────────────────────

    /** LOW risk — green bg, green bold text, green border */
    public XSSFCellStyle riskLow() {
        if (_riskLow == null) {
            _riskLow = base();
            applyFill(_riskLow, HEX_LOW_BG);
            applyFont(_riskLow, HEX_LOW_TEXT, 10, true, false);
            _riskLow.setAlignment(HorizontalAlignment.LEFT);
            _riskLow.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderFull(_riskLow, HEX_LOW_BORDER);
        }
        return _riskLow;
    }

    /** LOW risk — centered variant */
    public XSSFCellStyle riskLowCenter() {
        if (_riskLowCenter == null) {
            _riskLowCenter = base();
            applyFill(_riskLowCenter, HEX_LOW_BG);
            applyFont(_riskLowCenter, HEX_LOW_TEXT, 10, true, false);
            _riskLowCenter.setAlignment(HorizontalAlignment.CENTER);
            _riskLowCenter.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderFull(_riskLowCenter, HEX_LOW_BORDER);
        }
        return _riskLowCenter;
    }

    /** MEDIUM risk — amber bg, amber bold text */
    public XSSFCellStyle riskMedium() {
        if (_riskMedium == null) {
            _riskMedium = base();
            applyFill(_riskMedium, HEX_MED_BG);
            applyFont(_riskMedium, HEX_MED_TEXT, 10, true, false);
            _riskMedium.setAlignment(HorizontalAlignment.LEFT);
            _riskMedium.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderFull(_riskMedium, HEX_MED_BORDER);
        }
        return _riskMedium;
    }

    /** MEDIUM risk — centered variant */
    public XSSFCellStyle riskMediumCenter() {
        if (_riskMediumCenter == null) {
            _riskMediumCenter = base();
            applyFill(_riskMediumCenter, HEX_MED_BG);
            applyFont(_riskMediumCenter, HEX_MED_TEXT, 10, true, false);
            _riskMediumCenter.setAlignment(HorizontalAlignment.CENTER);
            _riskMediumCenter.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderFull(_riskMediumCenter, HEX_MED_BORDER);
        }
        return _riskMediumCenter;
    }

    /** HIGH risk — red bg, red bold text */
    public XSSFCellStyle riskHigh() {
        if (_riskHigh == null) {
            _riskHigh = base();
            applyFill(_riskHigh, HEX_HIGH_BG);
            applyFont(_riskHigh, HEX_HIGH_TEXT, 10, true, false);
            _riskHigh.setAlignment(HorizontalAlignment.LEFT);
            _riskHigh.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderFull(_riskHigh, HEX_HIGH_BORDER);
        }
        return _riskHigh;
    }

    /** HIGH risk — centered variant */
    public XSSFCellStyle riskHighCenter() {
        if (_riskHighCenter == null) {
            _riskHighCenter = base();
            applyFill(_riskHighCenter, HEX_HIGH_BG);
            applyFont(_riskHighCenter, HEX_HIGH_TEXT, 10, true, false);
            _riskHighCenter.setAlignment(HorizontalAlignment.CENTER);
            _riskHighCenter.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderFull(_riskHighCenter, HEX_HIGH_BORDER);
        }
        return _riskHighCenter;
    }

    /** CRITICAL risk — deep red bg, dark red bold text */
    public XSSFCellStyle riskCritical() {
        if (_riskCritical == null) {
            _riskCritical = base();
            applyFill(_riskCritical, HEX_CRIT_BG);
            applyFont(_riskCritical, HEX_CRIT_TEXT, 10, true, false);
            _riskCritical.setAlignment(HorizontalAlignment.LEFT);
            _riskCritical.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderFull(_riskCritical, HEX_CRIT_BORDER);
        }
        return _riskCritical;
    }

    /** CRITICAL risk — centered variant */
    public XSSFCellStyle riskCriticalCenter() {
        if (_riskCriticalCenter == null) {
            _riskCriticalCenter = base();
            applyFill(_riskCriticalCenter, HEX_CRIT_BG);
            applyFont(_riskCriticalCenter, HEX_CRIT_TEXT, 10, true, false);
            _riskCriticalCenter.setAlignment(HorizontalAlignment.CENTER);
            _riskCriticalCenter.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderFull(_riskCriticalCenter, HEX_CRIT_BORDER);
        }
        return _riskCriticalCenter;
    }

    // ── Score text cells (risk-colored text, no bg — for score number column) ──

    /** Score cell — colored text, no bg, bold, centered */
    public XSSFCellStyle scoreLow() {
        if (_scoreLow == null) {
            _scoreLow = base();
            applyFont(_scoreLow, HEX_LOW_TEXT, 11, true, false);
            _scoreLow.setAlignment(HorizontalAlignment.CENTER);
            _scoreLow.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_scoreLow, HEX_SLATE_200);
        }
        return _scoreLow;
    }

    public XSSFCellStyle scoreMedium() {
        if (_scoreMedium == null) {
            _scoreMedium = base();
            applyFont(_scoreMedium, HEX_MED_TEXT, 11, true, false);
            _scoreMedium.setAlignment(HorizontalAlignment.CENTER);
            _scoreMedium.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_scoreMedium, HEX_SLATE_200);
        }
        return _scoreMedium;
    }

    public XSSFCellStyle scoreHigh() {
        if (_scoreHigh == null) {
            _scoreHigh = base();
            applyFont(_scoreHigh, HEX_HIGH_TEXT, 11, true, false);
            _scoreHigh.setAlignment(HorizontalAlignment.CENTER);
            _scoreHigh.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_scoreHigh, HEX_SLATE_200);
        }
        return _scoreHigh;
    }

    public XSSFCellStyle scoreCritical() {
        if (_scoreCritical == null) {
            _scoreCritical = base();
            applyFont(_scoreCritical, HEX_CRIT_TEXT, 11, true, false);
            _scoreCritical.setAlignment(HorizontalAlignment.CENTER);
            _scoreCritical.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_scoreCritical, HEX_SLATE_200);
        }
        return _scoreCritical;
    }

    // ── Currency / number cells ────────────────────────────────────────────────

    /** Currency compact — right-aligned bold ("₹2.40 Cr") */
    public XSSFCellStyle currency() {
        if (_currency == null) {
            _currency = base();
            applyFont(_currency, HEX_NAVY_900, 10, true, false);
            _currency.setAlignment(HorizontalAlignment.RIGHT);
            _currency.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_currency, HEX_SLATE_200);
        }
        return _currency;
    }

    /** Percentage — right-aligned muted ("20%") */
    public XSSFCellStyle percentage() {
        if (_percentage == null) {
            _percentage = base();
            applyFont(_percentage, HEX_SLATE_500, 10, false, false);
            _percentage.setAlignment(HorizontalAlignment.CENTER);
            _percentage.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_percentage, HEX_SLATE_200);
        }
        return _percentage;
    }

    /** Bold number — right-aligned, navy */
    public XSSFCellStyle numberBold() {
        if (_numberBold == null) {
            _numberBold = base();
            applyFont(_numberBold, HEX_NAVY_900, 10, true, false);
            _numberBold.setAlignment(HorizontalAlignment.RIGHT);
            _numberBold.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderBottom(_numberBold, HEX_SLATE_200);
        }
        return _numberBold;
    }

    // ── Callout / notice ───────────────────────────────────────────────────────

    /** ⚠ Data quality notice row — amber bg, amber-800 italic text */
    public XSSFCellStyle calloutNotice() {
        if (_calloutNotice == null) {
            _calloutNotice = base();
            applyFill(_calloutNotice, HEX_CALLOUT_BG);
            applyFont(_calloutNotice, HEX_CALLOUT_TEXT, 9, false, true);
            _calloutNotice.setAlignment(HorizontalAlignment.LEFT);
            _calloutNotice.setVerticalAlignment(VerticalAlignment.CENTER);
            _calloutNotice.setWrapText(true);
            applyBorderFull(_calloutNotice, HEX_MED_BORDER);
            applyPadding(_calloutNotice);
        }
        return _calloutNotice;
    }

    // ── Status chip approximations ────────────────────────────────────────────

    /** COMPLETED / AVAILABLE — green */
    public XSSFCellStyle statusComplete() {
        if (_statusComplete == null) {
            _statusComplete = base();
            applyFill(_statusComplete, HEX_LOW_BG);
            applyFont(_statusComplete, HEX_LOW_TEXT, 9, true, false);
            _statusComplete.setAlignment(HorizontalAlignment.CENTER);
            _statusComplete.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderFull(_statusComplete, HEX_LOW_BORDER);
        }
        return _statusComplete;
    }

    /** IN PROGRESS / PARTIAL — amber */
    public XSSFCellStyle statusPending() {
        if (_statusPending == null) {
            _statusPending = base();
            applyFill(_statusPending, HEX_MED_BG);
            applyFont(_statusPending, HEX_MED_TEXT, 9, true, false);
            _statusPending.setAlignment(HorizontalAlignment.CENTER);
            _statusPending.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderFull(_statusPending, HEX_MED_BORDER);
        }
        return _statusPending;
    }

    /** UNAVAILABLE / NO DATA — red */
    public XSSFCellStyle statusUnavailable() {
        if (_statusUnavailable == null) {
            _statusUnavailable = base();
            applyFill(_statusUnavailable, HEX_HIGH_BG);
            applyFont(_statusUnavailable, HEX_HIGH_TEXT, 9, true, false);
            _statusUnavailable.setAlignment(HorizontalAlignment.CENTER);
            _statusUnavailable.setVerticalAlignment(VerticalAlignment.CENTER);
            applyBorderFull(_statusUnavailable, HEX_HIGH_BORDER);
        }
        return _statusUnavailable;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CONVENIENCE DISPATCHERS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Returns the correct risk cell style (centered) for a given RiskLevel name.
     * Accepts: "LOW", "MEDIUM", "HIGH", "CRITICAL"
     */
    public XSSFCellStyle riskForLevel(String levelName) {
        if (levelName == null) return dataRegularCenter();
        return switch (levelName.toUpperCase()) {
            case "LOW"      -> riskLowCenter();
            case "MEDIUM"   -> riskMediumCenter();
            case "HIGH"     -> riskHighCenter();
            case "CRITICAL" -> riskCriticalCenter();
            default         -> dataRegularCenter();
        };
    }

    /**
     * Returns the correct score style (colored text, no bg) for a given RiskLevel name.
     */
    public XSSFCellStyle scoreForLevel(String levelName) {
        if (levelName == null) return dataBoldCenter();
        return switch (levelName.toUpperCase()) {
            case "LOW"      -> scoreLow();
            case "MEDIUM"   -> scoreMedium();
            case "HIGH"     -> scoreHigh();
            case "CRITICAL" -> scoreCritical();
            default         -> dataBoldCenter();
        };
    }

    /**
     * Returns status chip style based on a status string.
     * "COMPLETED", "AVAILABLE", "LIVE" → statusComplete()
     * "PENDING", "PARTIAL", "MOCK"     → statusPending()
     * anything else                    → statusUnavailable()
     */
    public XSSFCellStyle statusForValue(String status) {
        if (status == null) return statusUnavailable();
        String u = status.toUpperCase();
        if (u.contains("COMPLET") || u.contains("AVAILAB") || u.contains("LIVE") || u.contains("VERIF")) {
            return statusComplete();
        }
        if (u.contains("PENDING") || u.contains("PARTIAL") || u.contains("MOCK") || u.contains("UNCERTAIN")) {
            return statusPending();
        }
        return statusUnavailable();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    /** Creates a blank XSSFCellStyle with no fill, no border, Calibri 10pt. */
    private XSSFCellStyle base() {
        XSSFCellStyle style = wb.createCellStyle();
        // Default font — Calibri 10pt navy (installed on every Windows/Mac/Linux-Office)
        XSSFFont font = wb.createFont();
        font.setFontName("Calibri");
        font.setFontHeightInPoints((short) 10);
        font.setColor(hexToXSSFColor(HEX_NAVY_900));
        style.setFont(font);
        return style;
    }

    /**
     * Applies a solid fill to the style using a hex color string (no "#" prefix).
     */
    private void applyFill(XSSFCellStyle style, String hex) {
        style.setFillForegroundColor(hexToXSSFColor(hex));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
    }

    /**
     * Applies a custom font to the style.
     * @param hex    text color hex (no "#")
     * @param size   point size
     * @param bold   true = bold
     * @param italic true = italic
     */
    private void applyFont(XSSFCellStyle style, String hex, int size, boolean bold, boolean italic) {
        XSSFFont font = wb.createFont();
        font.setFontName("Calibri");
        font.setFontHeightInPoints((short) size);
        font.setBold(bold);
        font.setItalic(italic);
        font.setColor(hexToXSSFColor(hex));
        style.setFont(font);
    }

    /**
     * Applies a thin bottom border in the given hex color.
     */
    private void applyBorderBottom(XSSFCellStyle style, String hex) {
        style.setBorderBottom(BorderStyle.THIN);
        style.setBottomBorderColor(hexToXSSFColor(hex));
    }

    /**
     * Applies a thin border on all four sides in the given hex color.
     */
    private void applyBorderFull(XSSFCellStyle style, String hex) {
        XSSFColor c = hexToXSSFColor(hex);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setTopBorderColor(c);
        style.setBottomBorderColor(c);
        style.setLeftBorderColor(c);
        style.setRightBorderColor(c);
    }

    /**
     * Applies a consistent left/right indent via POI's indentation.
     * Used on header rows where a left-pad visually separates text from cell edge.
     */
    private void applyPadding(XSSFCellStyle style) {
        style.setIndention((short) 1); // 1 character indent
    }

    /**
     * Converts a 6-char hex color string (no "#" prefix) to XSSFColor.
     * Example: "10B981" → XSSFColor with RGB {16, 185, 129}
     */
    public XSSFColor hexToXSSFColor(String hex) {
        int r = Integer.parseInt(hex.substring(0, 2), 16);
        int g = Integer.parseInt(hex.substring(2, 4), 16);
        int b = Integer.parseInt(hex.substring(4, 6), 16);
        return new XSSFColor(new byte[]{(byte) r, (byte) g, (byte) b}, null);
    }
}