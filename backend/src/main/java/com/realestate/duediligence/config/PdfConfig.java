package com.realestate.duediligence.config;

import org.springframework.context.annotation.Configuration;

import com.itextpdf.kernel.colors.DeviceRgb;

@Configuration
public class PdfConfig {

    // Primary Brand Colors (Matching Platform PDF Template)
    public static final DeviceRgb BRAND_EMERALD = new DeviceRgb(16, 185, 129);   // #10B981 Emerald
    public static final DeviceRgb BRAND_DARK_EMERALD = new DeviceRgb(22, 163, 74); // #16A34A Green
    public static final DeviceRgb PRIMARY_COLOR = new DeviceRgb(15, 23, 42);     // #0F172A Slate 900
    public static final DeviceRgb SECONDARY_COLOR = new DeviceRgb(14, 165, 233); // #0EA5E9 Sky 500
    public static final DeviceRgb ACCENT_COLOR = new DeviceRgb(16, 185, 129);   // Emerald 500
    public static final DeviceRgb TEXT_PRIMARY = new DeviceRgb(30, 41, 59);      // #1E293B Slate 800
    public static final DeviceRgb TEXT_MUTED = new DeviceRgb(100, 116, 139);    // #64748B Slate 500
    public static final DeviceRgb TEXT_LIGHT = new DeviceRgb(148, 163, 184);    // #94A3B8 Slate 400

    public static final DeviceRgb CARD_BG = new DeviceRgb(248, 250, 252);        // #F8FAFC Slate 50
    public static final DeviceRgb LIGHT_BG = new DeviceRgb(248, 250, 252);       // #F8FAFC Slate 50
    public static final DeviceRgb CARD_BORDER = new DeviceRgb(226, 232, 240);    // #E2E8F0 Slate 200

    public static final DeviceRgb LOW_RISK_COLOR = new DeviceRgb(22, 163, 74);   // Green
    public static final DeviceRgb LOW_RISK_BG = new DeviceRgb(240, 253, 244);      // Green 50
    public static final DeviceRgb LOW_RISK_BORDER = new DeviceRgb(187, 247, 208);  // Green 200

    public static final DeviceRgb MOD_RISK_COLOR = new DeviceRgb(217, 119, 6);   // Amber
    public static final DeviceRgb MOD_RISK_BG = new DeviceRgb(254, 243, 199);      // Amber 50
    public static final DeviceRgb MOD_RISK_BORDER = new DeviceRgb(253, 230, 138);  // Amber 200

    public static final DeviceRgb HIGH_RISK_COLOR = new DeviceRgb(220, 38, 38);  // Red
    public static final DeviceRgb HIGH_RISK_BG = new DeviceRgb(254, 226, 226);     // Red 50
    public static final DeviceRgb HIGH_RISK_BORDER = new DeviceRgb(254, 202, 202); // Red 200

    public static final float MARGIN_TOP = 28f;
    public static final float MARGIN_BOTTOM = 28f;
    public static final float MARGIN_LEFT = 32f;
    public static final float MARGIN_RIGHT = 32f;

    public static final String BRAND_NAME = "REAL ESTATE DUE DILIGENCE AGENT";
    public static final String BRAND_TITLE = "Due Diligence Platform";
    public static final String BRAND_SUBTITLE = "Real estate data intelligence";
}