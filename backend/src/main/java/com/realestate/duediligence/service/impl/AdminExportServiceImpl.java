package com.realestate.duediligence.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.CityActivityDto;
import com.realestate.duediligence.dto.DashboardStatsDto;
import com.realestate.duediligence.dto.MonthlyTrendDto;
import com.realestate.duediligence.dto.RiskDistributionDto;
import com.realestate.duediligence.service.AdminAnalyticsService;
import com.realestate.duediligence.service.AdminExportService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminExportServiceImpl implements AdminExportService {

    private final AdminAnalyticsService adminAnalyticsService;

    // ─────────────────────────────────────────────────────────────────────────
    // Script groups: maps language code → classpath font file names
    // English uses built-in Helvetica (no file needed).
    // hi and mr share Devanagari.
    // Urdu uses Nastaliq; no separate bold file exists, so regular is used for both.
    // ─────────────────────────────────────────────────────────────────────────
    private static final Map<String, String[]> FONT_FILES = Map.ofEntries(
            Map.entry("hi", new String[]{"NotoSansDevanagari-Regular.ttf", "NotoSansDevanagari-Bold.ttf"}),
            Map.entry("mr", new String[]{"NotoSansDevanagari-Regular.ttf", "NotoSansDevanagari-Bold.ttf"}),
            Map.entry("bn", new String[]{"NotoSansBengali-Regular.ttf",    "NotoSansBengali-Bold.ttf"}),
            Map.entry("gu", new String[]{"NotoSansGujarati-Regular.ttf",   "NotoSansGujarati-Bold.ttf"}),
            Map.entry("kn", new String[]{"NotoSansKannada-Regular.ttf",    "NotoSansKannada-Bold.ttf"}),
            Map.entry("ml", new String[]{"NotoSansMalayalam-Regular.ttf",  "NotoSansMalayalam-Bold.ttf"}),
            Map.entry("pa", new String[]{"NotoSansGurmukhi-Regular.ttf",   "NotoSansGurmukhi-Bold.ttf"}),
            Map.entry("ta", new String[]{"NotoSansTamil-Regular.ttf",      "NotoSansTamil-Bold.ttf"}),
            Map.entry("te", new String[]{"NotoSansTelugu-Regular.ttf",     "NotoSansTelugu-Bold.ttf"}),
            Map.entry("ur", new String[]{"NotoNastaliqUrdu-Regular.ttf",   "NotoNastaliqUrdu-Regular.ttf"})
    );


    // ─────────────────────────────────────────────────────────────────────────
    // Centralised translation map: lang → key → translated string
    // "en" is intentionally absent — the English switch below handles it.
    // ─────────────────────────────────────────────────────────────────────────
    private static final Map<String, Map<String, String>> TRANSLATIONS = Map.ofEntries(
        Map.entry("hi", Map.ofEntries(
            Map.entry("dashboardReport",   "एडमिन डैशबोर्ड रिपोर्ट"),
            Map.entry("summary",           "सारांश"),
            Map.entry("metric",            "मेट्रिक"),
            Map.entry("value",             "मान"),
            Map.entry("totalUsers",        "कुल उपयोगकर्ता"),
            Map.entry("totalProperties",   "कुल संपत्तियां"),
            Map.entry("reportsThisMonth",  "इस महीने की रिपोर्ट"),
            Map.entry("averageRiskScore",  "औसत जोखिम स्कोर"),
            Map.entry("riskDistribution",  "जोखिम वितरण"),
            Map.entry("level",             "स्तर"),
            Map.entry("count",             "गणना"),
            Map.entry("reportsTrend",      "रिपोर्ट रुझान"),
            Map.entry("date",              "तारीख"),
            Map.entry("topCities",         "शीर्ष शहर"),
            Map.entry("city",              "शहर"),
            Map.entry("propertyCount",     "संपत्ति गणना"),
            Map.entry("riskLow",           "कम"),
            Map.entry("riskMedium",        "मध्यम"),
            Map.entry("riskHigh",          "उच्च"),
            Map.entry("riskCritical",      "गंभीर")
        )),
        Map.entry("mr", Map.ofEntries(
            Map.entry("dashboardReport",   "प्रशासक डॅशबोर्ड अहवाल"),
            Map.entry("summary",           "सारांश"),
            Map.entry("metric",            "मेट्रिक"),
            Map.entry("value",             "मूल्य"),
            Map.entry("totalUsers",        "एकूण वापरकर्ते"),
            Map.entry("totalProperties",   "एकूण मालमत्ता"),
            Map.entry("reportsThisMonth",  "या महिन्याचे अहवाल"),
            Map.entry("averageRiskScore",  "सरासरी जोखीम स्कोर"),
            Map.entry("riskDistribution",  "जोखीम वितरण"),
            Map.entry("level",             "स्तर"),
            Map.entry("count",             "गणना"),
            Map.entry("reportsTrend",      "अहवाल ट्रेंड"),
            Map.entry("date",              "तारीख"),
            Map.entry("topCities",         "शीर्ष शहरे"),
            Map.entry("city",              "शहर"),
            Map.entry("propertyCount",     "मालमत्ता संख्या"),
            Map.entry("riskLow",           "कमी"),
            Map.entry("riskMedium",        "मध्यम"),
            Map.entry("riskHigh",          "उच्च"),
            Map.entry("riskCritical",      "गंभीर")
        )),
        Map.entry("bn", Map.ofEntries(
            Map.entry("dashboardReport",   "অ্যাডমিন ড্যাশবোর্ড রিপোর্ট"),
            Map.entry("summary",           "সারসংক্ষেপ"),
            Map.entry("metric",            "মেট্রিক"),
            Map.entry("value",             "মান"),
            Map.entry("totalUsers",        "মোট ব্যবহারকারী"),
            Map.entry("totalProperties",   "মোট সম্পত্তি"),
            Map.entry("reportsThisMonth",  "এই মাসের রিপোর্ট"),
            Map.entry("averageRiskScore",  "গড় ঝুঁকি স্কোর"),
            Map.entry("riskDistribution",  "ঝুঁকি বিতরণ"),
            Map.entry("level",             "স্তর"),
            Map.entry("count",             "সংখ্যা"),
            Map.entry("reportsTrend",      "রিপোর্ট প্রবণতা"),
            Map.entry("date",              "তারিখ"),
            Map.entry("topCities",         "শীর্ষ শহর"),
            Map.entry("city",              "শহর"),
            Map.entry("propertyCount",     "সম্পত্তি সংখ্যা"),
            Map.entry("riskLow",           "কম"),
            Map.entry("riskMedium",        "মধ্যম"),
            Map.entry("riskHigh",          "উচ্চ"),
            Map.entry("riskCritical",      "গুরুতর")
        ))
    );


    // Second half of translations map — Java's Map.ofEntries has a 10-entry limit per call,
    // so we store the remaining 7 languages in a separate constant and merge at lookup time.
    private static final Map<String, Map<String, String>> TRANSLATIONS2 = Map.ofEntries(
        Map.entry("gu", Map.ofEntries(
            Map.entry("dashboardReport",   "એડમિન ડૅશબૉર્ડ રિપૉર્ટ"),
            Map.entry("summary",           "સારાંશ"),
            Map.entry("metric",            "મેટ્રિક"),
            Map.entry("value",             "મૂલ્ય"),
            Map.entry("totalUsers",        "કુલ વપરાશકર્તા"),
            Map.entry("totalProperties",   "કુલ મિલકત"),
            Map.entry("reportsThisMonth",  "આ મહિનાના રિપૉર્ટ"),
            Map.entry("averageRiskScore",  "સરેરાશ જોખમ સ્કોર"),
            Map.entry("riskDistribution",  "જોખમ વિતરણ"),
            Map.entry("level",             "સ્તર"),
            Map.entry("count",             "ગણતરી"),
            Map.entry("reportsTrend",      "રિપૉર્ટ વલણ"),
            Map.entry("date",              "તારીખ"),
            Map.entry("topCities",         "ટૉપ શહેરો"),
            Map.entry("city",              "શહેર"),
            Map.entry("propertyCount",     "મિલકત સંખ્યા"),
            Map.entry("riskLow",           "ઓછ"),
            Map.entry("riskMedium",        "મધ્યમ"),
            Map.entry("riskHigh",          "ઉચ્ચ"),
            Map.entry("riskCritical",      "ગંભીર")
        )),
        Map.entry("kn", Map.ofEntries(
            Map.entry("dashboardReport",   "ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ವರದಿ"),
            Map.entry("summary",           "ಸಾರಾಂಶ"),
            Map.entry("metric",            "ಮೆಟ್ರಿಕ್"),
            Map.entry("value",             "ಮೌಲ್ಯ"),
            Map.entry("totalUsers",        "ಒಟ್ಟು ಬಳಕೆದಾರರು"),
            Map.entry("totalProperties",   "ಒಟ್ಟು ಆಸ್ತಿಗಳು"),
            Map.entry("reportsThisMonth",  "ಈ ತಿಂಗಳ ವರದಿಗಳು"),
            Map.entry("averageRiskScore",  "ಸರಾಸರಿ ಅಪಾಯ ಸ್ಕೋರ್"),
            Map.entry("riskDistribution",  "ಅಪಾಯ ವಿತರಣೆ"),
            Map.entry("level",             "ಮಟ್ಟ"),
            Map.entry("count",             "ಎಣಿಕೆ"),
            Map.entry("reportsTrend",      "ವರದಿ ಪ್ರವೃತ್ತಿ"),
            Map.entry("date",              "ದಿನಾಂಕ"),
            Map.entry("topCities",         "ಮೇಲ್ನಡೆ ನಗರಗಳು"),
            Map.entry("city",              "ನಗರ"),
            Map.entry("propertyCount",     "ಆಸ್ತಿ ಸಂಖ್ಯೆ"),
            Map.entry("riskLow",           "ಕಡಿಮೆ"),
            Map.entry("riskMedium",        "ಮಧ್ಯಮ"),
            Map.entry("riskHigh",          "ಹೆಚ್ಚು"),
            Map.entry("riskCritical",      "ಗಂಭೀರ")
        )),
        Map.entry("ml", Map.ofEntries(
            Map.entry("dashboardReport",   "അഡ്മിൻ ഡാഷ്‌ബോർഡ് റിപ്പോർട്ട്"),
            Map.entry("summary",           "സംഗ്രഹം"),
            Map.entry("metric",            "മെട്രിക്"),
            Map.entry("value",             "മൂല്യം"),
            Map.entry("totalUsers",        "മൊത്തം ഉപയോക്താക്കൾ"),
            Map.entry("totalProperties",   "മൊത്തം പ്രോപ്പർട്ടികൾ"),
            Map.entry("reportsThisMonth",  "ഈ മാസത്തെ റിപ്പോർട്ടുകൾ"),
            Map.entry("averageRiskScore",  "ശരാശരി റിസ്ക് സ്കോർ"),
            Map.entry("riskDistribution",  "റിസ്ക് വിതരണം"),
            Map.entry("level",             "തലം"),
            Map.entry("count",             "എണ്ണം"),
            Map.entry("reportsTrend",      "റിപ്പോർട്ട് പ്രവണത"),
            Map.entry("date",              "തീയതി"),
            Map.entry("topCities",         "ടോപ്പ് നഗരങ്ങൾ"),
            Map.entry("city",              "നഗരം"),
            Map.entry("propertyCount",     "പ്രോപ്പർട്ടി എണ്ണം"),
            Map.entry("riskLow",           "കുറഞ്ഞ"),
            Map.entry("riskMedium",        "മധ്യമം"),
            Map.entry("riskHigh",          "ഉയർന്ന"),
            Map.entry("riskCritical",      "ഗുരുതരം")
        )),
        Map.entry("pa", Map.ofEntries(
            Map.entry("dashboardReport",   "ਐਡਮਿਨ ਡੈਸ਼ਬੋਰਡ ਰਿਪੋਰਟ"),
            Map.entry("summary",           "ਸੰਖੇਪ"),
            Map.entry("metric",            "ਮੈਟ੍ਰਿਕ"),
            Map.entry("value",             "ਮੁੱਲ"),
            Map.entry("totalUsers",        "ਕੁੱਲ ਵਰਤੋਂਕਾਰ"),
            Map.entry("totalProperties",   "ਕੁੱਲ ਜਾਇਦਾਦ"),
            Map.entry("reportsThisMonth",  "ਇਸ ਮਹੀਨੇ ਦੀਆਂ ਰਿਪੋਰਟਾਂ"),
            Map.entry("averageRiskScore",  "ਔਸਤ ਜੋਖਮ ਸਕੋਰ"),
            Map.entry("riskDistribution",  "ਜੋਖਮ ਵੰਡ"),
            Map.entry("level",             "ਪੱਧਰ"),
            Map.entry("count",             "ਗਿਣਤੀ"),
            Map.entry("reportsTrend",      "ਰਿਪੋਰਟ ਰੁਝਾਨ"),
            Map.entry("date",              "ਮਿਤੀ"),
            Map.entry("topCities",         "ਚੋਟੀ ਦੇ ਸ਼ਹਿਰ"),
            Map.entry("city",              "ਸ਼ਹਿਰ"),
            Map.entry("propertyCount",     "ਜਾਇਦਾਦ ਗਿਣਤੀ"),
            Map.entry("riskLow",           "ਘੱਟ"),
            Map.entry("riskMedium",        "ਦਰਮਿਆਨਾ"),
            Map.entry("riskHigh",          "ਉੱਚ"),
            Map.entry("riskCritical",      "ਗੰਭੀਰ")
        )),
        Map.entry("ta", Map.ofEntries(
            Map.entry("dashboardReport",   "நிர்வாக டாஷ்போர்டு அறிக்கை"),
            Map.entry("summary",           "சுருக்கம்"),
            Map.entry("metric",            "அளவீடு"),
            Map.entry("value",             "மதிப்பு"),
            Map.entry("totalUsers",        "மொத்த பயனர்கள்"),
            Map.entry("totalProperties",   "மொத்த சொத்துக்கள்"),
            Map.entry("reportsThisMonth",  "இந்த மாத அறிக்கைகள்"),
            Map.entry("averageRiskScore",  "சராசரி அபாய மதிப்பெண்"),
            Map.entry("riskDistribution",  "அபாய விநியோகம்"),
            Map.entry("level",             "நிலை"),
            Map.entry("count",             "எண்ணிக்கை"),
            Map.entry("reportsTrend",      "அறிக்கை போக்கு"),
            Map.entry("date",              "தேதி"),
            Map.entry("topCities",         "முன்னணி நகரங்கள்"),
            Map.entry("city",              "நகரம்"),
            Map.entry("propertyCount",     "சொத்து எண்ணிக்கை"),
            Map.entry("riskLow",           "குறைந்த"),
            Map.entry("riskMedium",        "நடுத்தர"),
            Map.entry("riskHigh",          "அதிக"),
            Map.entry("riskCritical",      "மிகவும் தீவிரமான")
        )),
        Map.entry("te", Map.ofEntries(
            Map.entry("dashboardReport",   "అడ్మిన్ డాష్‌బోర్డ్ నివేదిక"),
            Map.entry("summary",           "సారాంశం"),
            Map.entry("metric",            "మెట్రిక్"),
            Map.entry("value",             "విలువ"),
            Map.entry("totalUsers",        "మొత్తం వినియోగదారులు"),
            Map.entry("totalProperties",   "మొత్తం ఆస్తులు"),
            Map.entry("reportsThisMonth",  "ఈ నెల నివేదికలు"),
            Map.entry("averageRiskScore",  "సగటు నష్ట స్కోరు"),
            Map.entry("riskDistribution",  "నష్ట పంపిణీ"),
            Map.entry("level",             "స్థాయి"),
            Map.entry("count",             "సంఖ్య"),
            Map.entry("reportsTrend",      "నివేదిక ధోరణి"),
            Map.entry("date",              "తేదీ"),
            Map.entry("topCities",         "అగ్ర నగరాలు"),
            Map.entry("city",              "నగరం"),
            Map.entry("propertyCount",     "ఆస్తి సంఖ్య"),
            Map.entry("riskLow",           "తక్కువ"),
            Map.entry("riskMedium",        "మధ్యమం"),
            Map.entry("riskHigh",          "అధికం"),
            Map.entry("riskCritical",      "తీవ్రమైన")
        )),
        Map.entry("ur", Map.ofEntries(
            Map.entry("dashboardReport",   "ایڈمن ڈیش بورڈ رپورٹ"),
            Map.entry("summary",           "خلاصہ"),
            Map.entry("metric",            "میٹرک"),
            Map.entry("value",             "قدر"),
            Map.entry("totalUsers",        "کل صارفین"),
            Map.entry("totalProperties",   "کل جائیدادیں"),
            Map.entry("reportsThisMonth",  "اس مہینے کی رپورٹیں"),
            Map.entry("averageRiskScore",  "اوسط خطرے کا اسکور"),
            Map.entry("riskDistribution",  "خطرے کی تقسیم"),
            Map.entry("level",             "سطح"),
            Map.entry("count",             "تعداد"),
            Map.entry("reportsTrend",      "رپورٹ کا رجحان"),
            Map.entry("date",              "تاریخ"),
            Map.entry("topCities",         "اعلی شہر"),
            Map.entry("city",              "شہر"),
            Map.entry("propertyCount",     "جائیداد کی تعداد"),
            Map.entry("riskLow",           "کم"),
            Map.entry("riskMedium",        "درمیانہ"),
            Map.entry("riskHigh",          "زیادہ"),
            Map.entry("riskCritical",      "نازک")
        ))
    );


    // ─────────────────────────────────────────────────────────────────────────
    // Translation helper — falls back to English for unknown languages
    // ─────────────────────────────────────────────────────────────────────────
    private String tr(String language, String key) {
        String lang = (language == null) ? "en" : language.toLowerCase();

        // Look in first translations map
        Map<String, String> langMap = TRANSLATIONS.get(lang);
        if (langMap == null) {
            // Try second map
            langMap = TRANSLATIONS2.get(lang);
        }
        if (langMap != null) {
            String val = langMap.get(key);
            if (val != null) return val;
        }

        // English fallback (also handles "en" directly)
        return switch (key) {
            case "dashboardReport"  -> "Admin Dashboard Report";
            case "summary"          -> "Summary";
            case "metric"           -> "Metric";
            case "value"            -> "Value";
            case "totalUsers"       -> "Total Users";
            case "totalProperties"  -> "Total Properties";
            case "reportsThisMonth" -> "Reports This Month";
            case "averageRiskScore" -> "Average Risk Score";
            case "riskDistribution" -> "Risk Distribution";
            case "level"            -> "Level";
            case "count"            -> "Count";
            case "reportsTrend"     -> "Reports Trend";
            case "date"             -> "Date";
            case "topCities"        -> "Top Cities";
            case "city"             -> "City";
            case "propertyCount"    -> "Property Count";
            case "riskLow"          -> "LOW";
            case "riskMedium"       -> "MEDIUM";
            case "riskHigh"         -> "HIGH";
            case "riskCritical"     -> "CRITICAL";
            default                 -> key;
        };
    }

    private String translateRiskLevel(String language, String level) {
        if (level == null) return "";
        return switch (level.toUpperCase()) {
            case "LOW"      -> tr(language, "riskLow");
            case "MEDIUM"   -> tr(language, "riskMedium");
            case "HIGH"     -> tr(language, "riskHigh");
            case "CRITICAL" -> tr(language, "riskCritical");
            default         -> level;
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public entry point
    // ─────────────────────────────────────────────────────────────────────────
    @Override
    public byte[] exportDashboard(String format, int periodDays, String language) {
        String lang = (language == null || language.isBlank()) ? "en" : language.toLowerCase();
        if ("excel".equalsIgnoreCase(format)) return exportExcel(periodDays, lang);
        if ("csv".equalsIgnoreCase(format))   return exportCsv(periodDays, lang);
        if ("pdf".equalsIgnoreCase(format))   return exportPdf(periodDays, lang);
        throw new IllegalArgumentException("Unsupported export format: " + format);
    }


    // ─────────────────────────────────────────────────────────────────────────
    // EXCEL export (Apache POI) — all 11 languages
    // ─────────────────────────────────────────────────────────────────────────
    private byte[] exportExcel(int periodDays, String language) {
        DashboardStatsDto stats  = adminAnalyticsService.getStats(periodDays);
        List<RiskDistributionDto> risk   = adminAnalyticsService.getRiskDistribution(periodDays);
        List<MonthlyTrendDto>     trend  = adminAnalyticsService.getReportsTrend(periodDays, "daily");
        List<CityActivityDto>     cities = adminAnalyticsService.getTopCities(10);

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);

            // Sheet 1 — Summary
            Sheet summary = workbook.createSheet(tr(language, "summary"));
            writeHeaderRow(summary, headerStyle, tr(language, "metric"), tr(language, "value"));
            writeRow(summary, 1, tr(language, "totalUsers"),       stats.getTotalUsers());
            writeRow(summary, 2, tr(language, "totalProperties"),  stats.getTotalProperties());
            writeRow(summary, 3, tr(language, "reportsThisMonth"), stats.getReportsThisMonth());
            writeRow(summary, 4, tr(language, "averageRiskScore"), stats.getAvgRiskScore());
            autoSizeColumns(summary, 2);

            // Sheet 2 — Risk Distribution
            Sheet riskSheet = workbook.createSheet(tr(language, "riskDistribution"));
            writeHeaderRow(riskSheet, headerStyle, tr(language, "level"), tr(language, "count"));
            int r = 1;
            for (RiskDistributionDto d : risk)
                writeRow(riskSheet, r++, translateRiskLevel(language, d.getLevel()), d.getCount());
            autoSizeColumns(riskSheet, 2);

            // Sheet 3 — Reports Trend
            Sheet trendSheet = workbook.createSheet(tr(language, "reportsTrend"));
            writeHeaderRow(trendSheet, headerStyle, tr(language, "date"), tr(language, "count"));
            r = 1;
            for (MonthlyTrendDto d : trend)
                writeRow(trendSheet, r++, d.getDate(), d.getCount());
            autoSizeColumns(trendSheet, 2);

            // Sheet 4 — Top Cities
            Sheet citiesSheet = workbook.createSheet(tr(language, "topCities"));
            writeHeaderRow(citiesSheet, headerStyle, tr(language, "city"), tr(language, "propertyCount"));
            r = 1;
            for (CityActivityDto d : cities)
                writeRow(citiesSheet, r++, d.getCity(), d.getPropertyCount());
            autoSizeColumns(citiesSheet, 2);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to generate dashboard Excel", e);
        }
    }


    // ─────────────────────────────────────────────────────────────────────────
    // CSV export — UTF-8 with BOM so Excel opens it correctly for all scripts
    // ─────────────────────────────────────────────────────────────────────────
    private byte[] exportCsv(int periodDays, String language) {
        DashboardStatsDto stats  = adminAnalyticsService.getStats(periodDays);
        List<RiskDistributionDto> risk   = adminAnalyticsService.getRiskDistribution(periodDays);
        List<MonthlyTrendDto>     trend  = adminAnalyticsService.getReportsTrend(periodDays, "daily");
        List<CityActivityDto>     cities = adminAnalyticsService.getTopCities(10);

        StringBuilder csv = new StringBuilder();

        // Summary
        csv.append(cv(tr(language,"metric"))).append(",").append(cv(tr(language,"value"))).append("\n");
        csv.append(cv(tr(language,"totalUsers"))).append(",").append(stats.getTotalUsers()).append("\n");
        csv.append(cv(tr(language,"totalProperties"))).append(",").append(stats.getTotalProperties()).append("\n");
        csv.append(cv(tr(language,"reportsThisMonth"))).append(",").append(stats.getReportsThisMonth()).append("\n");
        csv.append(cv(tr(language,"averageRiskScore"))).append(",").append(stats.getAvgRiskScore()).append("\n\n");

        // Risk Distribution
        csv.append(cv(tr(language,"riskDistribution"))).append("\n");
        csv.append(cv(tr(language,"level"))).append(",").append(cv(tr(language,"count"))).append("\n");
        for (RiskDistributionDto d : risk)
            csv.append(cv(translateRiskLevel(language, d.getLevel()))).append(",").append(d.getCount()).append("\n");
        csv.append("\n");

        // Reports Trend
        csv.append(cv(tr(language,"reportsTrend"))).append("\n");
        csv.append(cv(tr(language,"date"))).append(",").append(cv(tr(language,"count"))).append("\n");
        for (MonthlyTrendDto d : trend)
            csv.append(cv(d.getDate())).append(",").append(d.getCount()).append("\n");
        csv.append("\n");

        // Top Cities
        csv.append(cv(tr(language,"topCities"))).append("\n");
        csv.append(cv(tr(language,"city"))).append(",").append(cv(tr(language,"propertyCount"))).append("\n");
        for (CityActivityDto d : cities)
            csv.append(cv(d.getCity())).append(",").append(d.getPropertyCount()).append("\n");

        // UTF-8 BOM + content
        byte[] bom     = new byte[]{(byte)0xEF, (byte)0xBB, (byte)0xBF};
        byte[] content = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        byte[] result  = new byte[bom.length + content.length];
        System.arraycopy(bom, 0, result, 0, bom.length);
        System.arraycopy(content, 0, result, bom.length, content.length);
        return result;
    }

    /** CSV-safe quoting */
    private String cv(Object value) {
        if (value == null) return "";
        String text = String.valueOf(value);
        if (text.contains(",") || text.contains("\"") || text.contains("\n"))
            return "\"" + text.replace("\"", "\"\"") + "\"";
        return text;
    }


    // ─────────────────────────────────────────────────────────────────────────
    // PDF export (OpenPDF 1.3.39) — per-script font loading
    // ─────────────────────────────────────────────────────────────────────────
    private byte[] exportPdf(int periodDays, String language) {
        DashboardStatsDto stats  = adminAnalyticsService.getStats(periodDays);
        List<RiskDistributionDto> risk   = adminAnalyticsService.getRiskDistribution(periodDays);
        List<MonthlyTrendDto>     trend  = adminAnalyticsService.getReportsTrend(periodDays, "daily");
        List<CityActivityDto>     cities = adminAnalyticsService.getTopCities(10);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        com.lowagie.text.Document doc = new com.lowagie.text.Document(
                com.lowagie.text.PageSize.A4, 36, 36, 36, 36);

        try {
            com.lowagie.text.pdf.PdfWriter.getInstance(doc, out);

            // ── Font selection ──────────────────────────────────────────────
            final com.lowagie.text.pdf.BaseFont normalBf;
            final com.lowagie.text.pdf.BaseFont boldBf;

            String lang = (language == null) ? "en" : language.toLowerCase();
            String[] fontNames = FONT_FILES.get(lang);

            if (fontNames == null) {
                // English and unknown languages: use built-in Helvetica
                normalBf = com.lowagie.text.pdf.BaseFont.createFont(
                        com.lowagie.text.pdf.BaseFont.HELVETICA,
                        com.lowagie.text.pdf.BaseFont.CP1252,
                        com.lowagie.text.pdf.BaseFont.NOT_EMBEDDED);
                boldBf = com.lowagie.text.pdf.BaseFont.createFont(
                        com.lowagie.text.pdf.BaseFont.HELVETICA_BOLD,
                        com.lowagie.text.pdf.BaseFont.CP1252,
                        com.lowagie.text.pdf.BaseFont.NOT_EMBEDDED);
            } else {
                normalBf = loadFont(fontNames[0]);
                boldBf   = loadFont(fontNames[1]);
            }

            com.lowagie.text.Font normalFont = new com.lowagie.text.Font(normalBf, 10, com.lowagie.text.Font.NORMAL);
            com.lowagie.text.Font boldFont   = new com.lowagie.text.Font(boldBf,   12, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font titleFont  = new com.lowagie.text.Font(boldBf,   20, com.lowagie.text.Font.BOLD);

            doc.open();

            // Title
            com.lowagie.text.Paragraph title = new com.lowagie.text.Paragraph(
                    tr(language, "dashboardReport"), titleFont);
            title.setAlignment(com.lowagie.text.Element.ALIGN_CENTER);
            doc.add(title);
            doc.add(new com.lowagie.text.Paragraph(" ", normalFont));

            // Summary table
            addSectionTitle(doc, tr(language, "summary"), boldFont, normalFont);
            com.lowagie.text.pdf.PdfPTable t1 = newTable(2);
            addHeaderCell(t1, tr(language, "metric"),            boldFont);
            addHeaderCell(t1, tr(language, "value"),             boldFont);
            addRow(t1, tr(language, "totalUsers"),               String.valueOf(stats.getTotalUsers()),       normalFont);
            addRow(t1, tr(language, "totalProperties"),          String.valueOf(stats.getTotalProperties()),  normalFont);
            addRow(t1, tr(language, "reportsThisMonth"),         String.valueOf(stats.getReportsThisMonth()), normalFont);
            addRow(t1, tr(language, "averageRiskScore"),         String.valueOf(stats.getAvgRiskScore()),     normalFont);
            doc.add(t1);
            doc.add(new com.lowagie.text.Paragraph(" ", normalFont));

            // Risk distribution table
            addSectionTitle(doc, tr(language, "riskDistribution"), boldFont, normalFont);
            com.lowagie.text.pdf.PdfPTable t2 = newTable(2);
            addHeaderCell(t2, tr(language, "level"), boldFont);
            addHeaderCell(t2, tr(language, "count"), boldFont);
            for (RiskDistributionDto d : risk)
                addRow(t2, translateRiskLevel(language, d.getLevel()), String.valueOf(d.getCount()), normalFont);
            doc.add(t2);
            doc.add(new com.lowagie.text.Paragraph(" ", normalFont));

            // Reports trend table
            addSectionTitle(doc, tr(language, "reportsTrend"), boldFont, normalFont);
            com.lowagie.text.pdf.PdfPTable t3 = newTable(2);
            addHeaderCell(t3, tr(language, "date"),  boldFont);
            addHeaderCell(t3, tr(language, "count"), boldFont);
            for (MonthlyTrendDto d : trend)
                addRow(t3, String.valueOf(d.getDate()), String.valueOf(d.getCount()), normalFont);
            doc.add(t3);
            doc.add(new com.lowagie.text.Paragraph(" ", normalFont));

            // Top cities table
            addSectionTitle(doc, tr(language, "topCities"), boldFont, normalFont);
            com.lowagie.text.pdf.PdfPTable t4 = newTable(2);
            addHeaderCell(t4, tr(language, "city"),          boldFont);
            addHeaderCell(t4, tr(language, "propertyCount"), boldFont);
            for (CityActivityDto d : cities)
                addRow(t4, String.valueOf(d.getCity()), String.valueOf(d.getPropertyCount()), normalFont);
            doc.add(t4);

            doc.close();
            return out.toByteArray();

        } catch (Exception e) {
            if (doc.isOpen()) doc.close();
            throw new RuntimeException("Failed to generate dashboard PDF", e);
        }
    }

    /** Load a font from classpath /fonts/ using the byte-array overload so OpenPDF
     *  never tries to resolve the name as a filesystem path. */
    private com.lowagie.text.pdf.BaseFont loadFont(String filename) throws Exception {
        try (InputStream is = getClass().getResourceAsStream("/fonts/" + filename)) {
            if (is == null)
                throw new IllegalStateException("Font not found in classpath: /fonts/" + filename);
            byte[] bytes = is.readAllBytes();
            return com.lowagie.text.pdf.BaseFont.createFont(
                    filename,
                    com.lowagie.text.pdf.BaseFont.IDENTITY_H,
                    com.lowagie.text.pdf.BaseFont.EMBEDDED,
                    true, bytes, null);
        }
    }


    // ─────────────────────────────────────────────────────────────────────────
    // PDF helper methods
    // ─────────────────────────────────────────────────────────────────────────
    private static com.lowagie.text.pdf.PdfPTable newTable(int cols) {
        com.lowagie.text.pdf.PdfPTable t = new com.lowagie.text.pdf.PdfPTable(cols);
        t.setWidthPercentage(100);
        return t;
    }

    private static void addSectionTitle(
            com.lowagie.text.Document doc,
            String text,
            com.lowagie.text.Font boldFont,
            com.lowagie.text.Font normalFont) throws Exception {
        doc.add(new com.lowagie.text.Paragraph(text, boldFont));
        doc.add(new com.lowagie.text.Paragraph(" ", normalFont));
    }

    private static void addHeaderCell(
            com.lowagie.text.pdf.PdfPTable table,
            String text,
            com.lowagie.text.Font font) {
        com.lowagie.text.pdf.PdfPCell cell = new com.lowagie.text.pdf.PdfPCell(
                new com.lowagie.text.Phrase(text, font));
        cell.setBackgroundColor(new java.awt.Color(230, 230, 230));
        cell.setPadding(6);
        table.addCell(cell);
    }

    private static void addRow(
            com.lowagie.text.pdf.PdfPTable table,
            String first,
            String second,
            com.lowagie.text.Font font) {
        com.lowagie.text.pdf.PdfPCell c1 = new com.lowagie.text.pdf.PdfPCell(
                new com.lowagie.text.Phrase(first,  font));
        c1.setPadding(5);
        com.lowagie.text.pdf.PdfPCell c2 = new com.lowagie.text.pdf.PdfPCell(
                new com.lowagie.text.Phrase(second, font));
        c2.setPadding(5);
        table.addCell(c1);
        table.addCell(c2);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Excel helper methods
    // ─────────────────────────────────────────────────────────────────────────
    private static void writeHeaderRow(Sheet sheet, CellStyle style, String... headers) {
        Row row = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }

    private static void writeRow(Sheet sheet, int rowIndex, String label, long value) {
        Row row = sheet.createRow(rowIndex);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value);
    }

    private static void writeRow(Sheet sheet, int rowIndex, String label, double value) {
        Row row = sheet.createRow(rowIndex);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value);
    }

    private static void autoSizeColumns(Sheet sheet, int columnCount) {
        for (int i = 0; i < columnCount; i++) sheet.autoSizeColumn(i);
    }
}
