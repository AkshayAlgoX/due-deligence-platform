// backend/src/test/java/com/realestate/duediligence/service/impl/ChartGeneratorImplTest.java
package com.realestate.duediligence.service.impl;

import java.io.File;
import java.io.FileOutputStream;
import java.util.List;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import com.realestate.duediligence.enums.RiskCategory;
import com.realestate.duediligence.service.ChartGenerator;
import com.realestate.duediligence.service.ChartGenerator.CategoryScore;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Renders all 3 chart types and writes samples to target/chart-samples/
 * for visual inspection.
 *
 * Run: ./mvnw test -Dtest=ChartGeneratorImplTest
 * Then open: backend/target/chart-samples/
 */
class ChartGeneratorImplTest {

    private static final File OUT_DIR = new File("target/chart-samples");
    private final ChartGenerator gen = new ChartGeneratorImpl();

    @BeforeAll
    static void setup() {
        OUT_DIR.mkdirs();
    }

    @Test
    void renderRiskGauge_lowRisk() throws Exception {
        byte[] png = gen.renderRiskGauge(18.3);
        assertNotNull(png);
        assertTrue(png.length > 100, "PNG should have real content");
        writeFile("gauge_low_18.3.png", png);
    }

    @Test
    void renderRiskGauge_moderateRisk() throws Exception {
        byte[] png = gen.renderRiskGauge(45.0);
        writeFile("gauge_moderate_45.png", png);
    }

    @Test
    void renderRiskGauge_highRisk() throws Exception {
        byte[] png = gen.renderRiskGauge(72.5);
        writeFile("gauge_high_72.5.png", png);
    }

    @Test
    void renderRiskGauge_criticalRisk() throws Exception {
        byte[] png = gen.renderRiskGauge(91.0);
        writeFile("gauge_critical_91.png", png);
    }

    @Test
    void renderCategoryBarChart() throws Exception {
        List<CategoryScore> scores = List.of(
                new CategoryScore(RiskCategory.FLOOD, 15.0),
                new CategoryScore(RiskCategory.LEGAL, 15.0),
                new CategoryScore(RiskCategory.TAX, 15.0),
                new CategoryScore(RiskCategory.ZONING, 15.0),
                new CategoryScore(RiskCategory.ENVIRONMENTAL, 45.0),
                new CategoryScore(RiskCategory.MARKET, 2.5)
        );
        byte[] png = gen.renderCategoryBarChart(scores);
        writeFile("bar_categories.png", png);
    }

    @Test
    void renderWeightsDonutChart() throws Exception {
        byte[] png = gen.renderWeightsDonutChart();
        writeFile("donut_weights.png", png);
    }

    private void writeFile(String name, byte[] data) throws Exception {
        File f = new File(OUT_DIR, name);
        try (FileOutputStream fos = new FileOutputStream(f)) {
            fos.write(data);
        }
        System.out.println("[chart-test] Wrote: " + f.getAbsolutePath());
    }
}