// backend/src/main/java/com/realestate/duediligence/service/impl/ChartGeneratorImpl.java
package com.realestate.duediligence.service.impl;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.Arc2D;
import java.awt.geom.Ellipse2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.text.DecimalFormat;
import java.util.List;

import javax.imageio.ImageIO;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.axis.CategoryAxis;
import org.jfree.chart.axis.NumberAxis;
import org.jfree.chart.axis.NumberTickUnit;
import org.jfree.chart.labels.StandardPieSectionLabelGenerator;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.plot.PiePlot;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.renderer.category.BarRenderer;
import org.jfree.chart.renderer.category.StandardBarPainter;
import org.jfree.chart.ui.RectangleInsets;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.general.DefaultPieDataset;
import org.springframework.stereotype.Service;

import com.realestate.duediligence.config.PdfDesignSystem;
import com.realestate.duediligence.enums.RiskCategory;
import com.realestate.duediligence.service.ChartGenerator;

/**
 * JFreeChart-based chart generator for PDF report embedding.
 *
 * Session 25 fixes:
 * - CategoryScore field access: item.score / item.category (not record accessors)
 * - renderWeightsDonutChart(): correct method name + signature matching interface
 * - Bar chart: fixed 20-unit tick intervals (0, 20, 40, 60, 80, 100)
 * - Donut chart: percentage labels on slices
 * - renderRiskGauge(): full Session 23 implementation preserved
 */
@Service
public class ChartGeneratorImpl implements ChartGenerator {

    // ── Brand Colors (AWT — not iText DeviceRgb) ────────────────────────
    private static final Color NAVY_900    = new Color(15,  23,  42);
    private static final Color EMERALD_500 = new Color(16,  185, 129);
    private static final Color SLATE_50    = new Color(248, 250, 252);
    private static final Color SLATE_200   = new Color(226, 232, 240);
    private static final Color SLATE_400   = new Color(148, 163, 184);
    private static final Color SLATE_500   = new Color(100, 116, 139);

    private static final Color LOW_COLOR  = new Color(22,  163, 74);
    private static final Color MED_COLOR  = new Color(234, 179, 8);
    private static final Color HIGH_COLOR = new Color(249, 115, 22);
    private static final Color CRIT_COLOR = new Color(220, 38,  38);

    // ═══════════════════════════════════════════════════════════════
    // GAUGE (Session 23 — preserved exactly)
    // ═══════════════════════════════════════════════════════════════

    // backend/src/main/java/com/realestate/duediligence/service/impl/ChartGeneratorImpl.java
// ─── Replace the renderRiskGauge() method ONLY ──────────────────────────

@Override
public byte[] renderRiskGauge(double score) {
    int W = 520, H = 340;   // wider + taller canvas for bigger labels
    BufferedImage img = new BufferedImage(W, H, BufferedImage.TYPE_INT_ARGB);
    Graphics2D g = img.createGraphics();

    g.setRenderingHint(RenderingHints.KEY_ANTIALIASING,      RenderingHints.VALUE_ANTIALIAS_ON);
    g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
    g.setRenderingHint(RenderingHints.KEY_RENDERING,         RenderingHints.VALUE_RENDER_QUALITY);

    g.setColor(new Color(0, 0, 0, 0));
    g.fillRect(0, 0, W, H);

    int cx = W / 2;
    int cy = H - 80;          // pivot lifted so tick labels + "out of 100" both fit
    int outerR = 170;
    int innerR = 110;
    int trackR = 160;
    float trackStroke = outerR - innerR - 4f;

    // ── Colored zone arcs ────────────────────────────────────────────
    g.setStroke(new BasicStroke(trackStroke, BasicStroke.CAP_BUTT, BasicStroke.JOIN_MITER));

    g.setColor(LOW_COLOR);
    g.draw(new Arc2D.Double(cx - trackR, cy - trackR, 2.0 * trackR, 2.0 * trackR, 135, 45, Arc2D.OPEN));
    g.setColor(MED_COLOR);
    g.draw(new Arc2D.Double(cx - trackR, cy - trackR, 2.0 * trackR, 2.0 * trackR, 90, 45, Arc2D.OPEN));
    g.setColor(HIGH_COLOR);
    g.draw(new Arc2D.Double(cx - trackR, cy - trackR, 2.0 * trackR, 2.0 * trackR, 45, 45, Arc2D.OPEN));
    g.setColor(CRIT_COLOR);
    g.draw(new Arc2D.Double(cx - trackR, cy - trackR, 2.0 * trackR, 2.0 * trackR, 0, 45, Arc2D.OPEN));

    // ── Needle ───────────────────────────────────────────────────────
    double angleDeg = 180.0 - (score / 100.0) * 180.0;
    double angleRad = Math.toRadians(angleDeg);
    int needleLen = trackR - 8;
    int nx = (int) (cx + needleLen * Math.cos(angleRad));
    int ny = (int) (cy - needleLen * Math.sin(angleRad));

    g.setColor(NAVY_900);
    g.setStroke(new BasicStroke(3f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
    g.drawLine(cx, cy, nx, ny);

    int pivotR = 8;
    g.setColor(NAVY_900);
    g.fill(new Ellipse2D.Double(cx - pivotR, cy - pivotR, pivotR * 2, pivotR * 2));
    g.setColor(SLATE_50);
    g.fill(new Ellipse2D.Double(cx - pivotR + 3, cy - pivotR + 3, (pivotR - 3) * 2, (pivotR - 3) * 2));

    Color scoreColor = score <= 25 ? LOW_COLOR
                     : score <= 50 ? MED_COLOR
                     : score <= 75 ? HIGH_COLOR
                     : CRIT_COLOR;
    String levelLabel = score <= 25 ? "LOW RISK"
                      : score <= 50 ? "MODERATE"
                      : score <= 75 ? "HIGH RISK"
                      : "CRITICAL";

    // ── Score number (big, colored) ──────────────────────────────────
    String scoreText = new DecimalFormat("0.0").format(score);
    Font scoreFont = new Font("SansSerif", Font.BOLD, 46);
    g.setFont(scoreFont);
    FontMetrics sfm = g.getFontMetrics();
    int scoreW = sfm.stringWidth(scoreText);
    int scoreY = cy - 55;
    g.setColor(scoreColor);
    g.drawString(scoreText, cx - scoreW / 2, scoreY);

    // ── Level label (bonded to score) ────────────────────────────────
    Font levelFont = new Font("SansSerif", Font.BOLD, 16);
    g.setFont(levelFont);
    FontMetrics lfm = g.getFontMetrics();
    int levelY = scoreY + 22;
    g.setColor(scoreColor);
    g.drawString(levelLabel, cx - lfm.stringWidth(levelLabel) / 2, levelY);

    // ── "out of 100" caption — BIGGER (13pt) ─────────────────────────
    Font subFont = new Font("SansSerif", Font.PLAIN, 13);   // was 10pt
    g.setFont(subFont);
    g.setColor(SLATE_500);
    FontMetrics sbfm = g.getFontMetrics();
    String subLabel = "out of 100";
    int subY = cy + 34;
    g.drawString(subLabel, cx - sbfm.stringWidth(subLabel) / 2, subY);

    // ── TICK LABELS — 15pt Bold, fully outside arc ───────────────────
    // KEY CHANGE: labelR = outerR + 32 (was +18)
    // Bigger font (15pt Bold, was 11pt), and each tick gets angle-aware
    // padding so no label crosses the arc geometry.
    Font tickFont = new Font("SansSerif", Font.BOLD, 15);   // was 11pt
    g.setFont(tickFont);
    g.setColor(SLATE_500);
    FontMetrics tfm = g.getFontMetrics();

    int[] tickScores = {0, 25, 50, 75, 100};
    int labelR = outerR + 32;   // was +18 — much more clearance

    for (int ts : tickScores) {
        double tAngleDeg = 180.0 - (ts / 100.0) * 180.0;
        double tAngleRad = Math.toRadians(tAngleDeg);
        int tx = (int) (cx + labelR * Math.cos(tAngleRad));
        int ty = (int) (cy - labelR * Math.sin(tAngleRad));

        String tickStr = String.valueOf(ts);
        int labelX = tx - tfm.stringWidth(tickStr) / 2;
        int labelY = ty + tfm.getAscent() / 2 - 2;

        // Per-tick fine-tuning so labels sit visually outside the arc
        // at every angle without any part touching arc curvature
        if (ts == 0)   labelX -= 6;             // push further left
        if (ts == 100) labelX += 6;             // push further right
        if (ts == 25)  { labelX -= 4; labelY -= 4; }   // upper-left diagonal
        if (ts == 75)  { labelX += 4; labelY -= 4; }   // upper-right diagonal
        if (ts == 50)  labelY -= 10;            // top — push clearly ABOVE arc peak

        g.drawString(tickStr, labelX, labelY);
    }

    g.dispose();
    return toPng(img);
}
    // ═══════════════════════════════════════════════════════════════
    // BAR CHART — Fixed tick units (Issue R)
    // ═══════════════════════════════════════════════════════════════

    @Override
    public byte[] renderCategoryBarChart(List<CategoryScore> data) {
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();

        // FIX: CategoryScore is a plain class — use .category and .score directly (not record accessors)
        for (CategoryScore item : data) {
            dataset.addValue(
                item.score,                                                  // FIX: field, not item.score()
                "Risk Score",
                PdfDesignSystem.displayNameForCategory(item.category)        // FIX: field, not item.category()
            );
        }

        JFreeChart chart = ChartFactory.createBarChart(
                null, null, null, dataset,
                PlotOrientation.HORIZONTAL, false, false, false
        );

        chart.setBackgroundPaint(Color.WHITE);
        chart.setPadding(new RectangleInsets(8, 8, 8, 8));

        CategoryPlot plot = chart.getCategoryPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setOutlineVisible(false);
        plot.setRangeGridlinePaint(SLATE_200);
        plot.setRangeGridlinesVisible(true);
        plot.setDomainGridlinesVisible(false);
        plot.setInsets(new RectangleInsets(4, 0, 4, 12));

        // Category (left) axis styling
        CategoryAxis domainAxis = plot.getDomainAxis();
        domainAxis.setTickLabelFont(new Font("SansSerif", Font.PLAIN, 10));
        domainAxis.setTickLabelPaint(NAVY_900);
        domainAxis.setAxisLineVisible(false);
        domainAxis.setTickMarksVisible(false);

        // ── X-Axis: fixed range 0-100, tick every 20 (Issue R) ──────────
        NumberAxis rangeAxis = (NumberAxis) plot.getRangeAxis();
        rangeAxis.setRange(0.0, 100.0);
        rangeAxis.setTickUnit(new NumberTickUnit(20.0));   // 0, 20, 40, 60, 80, 100
        rangeAxis.setTickLabelFont(new Font("SansSerif", Font.PLAIN, 10));
        rangeAxis.setTickLabelPaint(SLATE_500);
        rangeAxis.setAxisLineVisible(false);
        rangeAxis.setTickMarksVisible(false);

        // Bar styling
        BarRenderer renderer = (BarRenderer) plot.getRenderer();
        renderer.setSeriesPaint(0, EMERALD_500);
        renderer.setBarPainter(new StandardBarPainter());
        renderer.setShadowVisible(false);
        renderer.setDrawBarOutline(false);
        renderer.setMaximumBarWidth(0.5);
        renderer.setItemMargin(0.15);

        return exportToPng(chart, 520, 240);
    }

    // ═══════════════════════════════════════════════════════════════
    // WEIGHTS DONUT CHART — Correct method name matching interface
    // (Issue: we had renderRiskDonutChart — wrong name)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Renders a donut chart of the 6 category weight distribution.
     *
     * Weights are hardcoded constants — they don't vary per-property.
     * The interface declares no parameters: {@code renderWeightsDonutChart()}.
     */
    @Override
    public byte[] renderWeightsDonutChart() {
        DefaultPieDataset<String> dataset = new DefaultPieDataset<>();

        // Weights must match those used by the risk aggregation engine
        dataset.setValue(PdfDesignSystem.displayNameForCategory(RiskCategory.FLOOD),         20.0);
        dataset.setValue(PdfDesignSystem.displayNameForCategory(RiskCategory.LEGAL),         20.0);
        dataset.setValue(PdfDesignSystem.displayNameForCategory(RiskCategory.TAX),           15.0);
        dataset.setValue(PdfDesignSystem.displayNameForCategory(RiskCategory.ZONING),        20.0);
        dataset.setValue(PdfDesignSystem.displayNameForCategory(RiskCategory.ENVIRONMENTAL), 15.0);
        dataset.setValue(PdfDesignSystem.displayNameForCategory(RiskCategory.MARKET),        10.0);

        JFreeChart chart = ChartFactory.createPieChart(null, dataset, true, false, false);
        chart.setBackgroundPaint(Color.WHITE);

        @SuppressWarnings("unchecked")
        PiePlot<String> plot = (PiePlot<String>) chart.getPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setOutlineVisible(false);
        plot.setShadowPaint(null);
        plot.setInteriorGap(0.08);
        plot.setSectionOutlinesVisible(false);

        // ── Slice percentage labels (Issue S) ───────────────────────────
        // "{2}" = percentage format, e.g. "20%"
        plot.setLabelGenerator(new StandardPieSectionLabelGenerator("{2}"));
        plot.setLabelFont(new Font("SansSerif", Font.BOLD, 10));
        plot.setLabelBackgroundPaint(null);
        plot.setLabelOutlinePaint(null);
        plot.setLabelShadowPaint(null);
        plot.setLabelPaint(NAVY_900);

        // Brand color palette (6 slices)
        plot.setSectionPaint(PdfDesignSystem.displayNameForCategory(RiskCategory.FLOOD),         EMERALD_500);
        plot.setSectionPaint(PdfDesignSystem.displayNameForCategory(RiskCategory.LEGAL),         new Color(14,  165, 233));  // Sky 500
        plot.setSectionPaint(PdfDesignSystem.displayNameForCategory(RiskCategory.TAX),           new Color(99,  102, 241));  // Indigo 500
        plot.setSectionPaint(PdfDesignSystem.displayNameForCategory(RiskCategory.ZONING),        new Color(168, 85,  247));  // Purple 500
        plot.setSectionPaint(PdfDesignSystem.displayNameForCategory(RiskCategory.ENVIRONMENTAL), new Color(236, 72,  153));  // Pink 500
        plot.setSectionPaint(PdfDesignSystem.displayNameForCategory(RiskCategory.MARKET),        SLATE_500);

        return exportToPng(chart, 420, 300);
    }

    // ═══════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════

    private byte[] exportToPng(JFreeChart chart, int width, int height) {
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            BufferedImage img = chart.createBufferedImage(width, height);
            ImageIO.write(img, "png", bos);
            return bos.toByteArray();
        } catch (Exception e) {
            return new byte[0];
        }
    }

    private byte[] toPng(BufferedImage img) {
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            ImageIO.write(img, "png", bos);
            return bos.toByteArray();
        } catch (Exception e) {
            return new byte[0];
        }
    }
}