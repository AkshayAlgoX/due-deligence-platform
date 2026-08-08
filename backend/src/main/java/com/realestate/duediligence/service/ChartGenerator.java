// backend/src/main/java/com/realestate/duediligence/service/ChartGenerator.java
package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.enums.RiskCategory;

/**
 * Generates chart images (PNG byte arrays) for embedding into PDF reports.
 *
 * <p>All charts are rendered at 2x DPI (retina resolution) for crisp
 * printing and high-quality on-screen viewing. iText embeds them at
 * their intended display size, so the extra pixels give clarity without
 * inflating layout dimensions.
 *
 * <p>All methods return {@code byte[]} PNG data — never null.
 * On rendering failure, methods return a 1x1 transparent placeholder
 * so PDF generation never crashes.
 */
public interface ChartGenerator {

    /**
     * Renders a premium semicircular risk score gauge.
     *
     * <p>Design:
     * <ul>
     *   <li>Semicircle arc with 4 color zones (green→yellow→orange→red)</li>
     *   <li>Needle pointing to current score</li>
     *   <li>Large score number in center</li>
     *   <li>Risk level label ("LOW RISK", "MODERATE", etc.)</li>
     * </ul>
     *
     * @param score 0-100 overall risk score
     * @return PNG bytes (transparent background)
     */
    byte[] renderRiskGauge(double score);

    /**
     * Renders a horizontal bar chart of category scores.
     *
     * <p>Design:
     * <ul>
     *   <li>One bar per category, sorted highest-risk first</li>
     *   <li>Bars colored by risk level (green/yellow/orange/red)</li>
     *   <li>Score labels at end of each bar</li>
     *   <li>Category names on left axis</li>
     * </ul>
     *
     * @param scores list of category+score pairs (order controls display order)
     * @return PNG bytes (white background)
     */
    byte[] renderCategoryBarChart(List<CategoryScore> scores);

    /**
     * Renders a donut chart showing category weight distribution.
     *
     * <p>Design:
     * <ul>
     *   <li>6-slice donut with brand colors</li>
     *   <li>Percentage labels on each slice</li>
     *   <li>Legend below</li>
     * </ul>
     *
     * @return PNG bytes (white background)
     */
    byte[] renderWeightsDonutChart();

    /**
     * Immutable pair for the bar chart input.
     */
    class CategoryScore {
        public final RiskCategory category;
        public final double score;

        public CategoryScore(RiskCategory category, double score) {
            this.category = category;
            this.score = score;
        }
    }
}