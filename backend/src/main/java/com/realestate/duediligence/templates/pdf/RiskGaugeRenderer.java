package com.realestate.duediligence.templates.pdf;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import javax.imageio.ImageIO;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.layout.element.Image;

public class RiskGaugeRenderer {

    public static Image generateRiskGaugeImage(double score, int width, int height) {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2 = image.createGraphics();

        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        int cx = width / 2;
        int cy = height / 2 + 20;
        int radius = Math.min(width, height) / 2 - 25;

        // Background Arc Track (180 degrees)
        g2.setStroke(new BasicStroke(24f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g2.setColor(new Color(226, 232, 240)); // Slate 200
        g2.drawArc(cx - radius, cy - radius, radius * 2, radius * 2, 0, 180);

        // Score Arc Color determination
        Color arcColor;
        if (score < 35) {
            arcColor = new Color(16, 185, 129); // Low Risk (Green)
        } else if (score < 70) {
            arcColor = new Color(245, 158, 11); // Medium Risk (Amber)
        } else {
            arcColor = new Color(239, 68, 68);  // High Risk (Red)
        }

        double clampedScore = Math.max(0, Math.min(100, score));
        int sweepAngle = (int) Math.round((clampedScore / 100.0) * 180.0);

        g2.setColor(arcColor);
        g2.drawArc(cx - radius, cy - radius, radius * 2, radius * 2, 180 - sweepAngle, sweepAngle);

        // Center Score Text
        g2.setColor(new Color(15, 23, 42)); // Slate 900
        g2.setFont(new Font("SansSerif", Font.BOLD, 28));
        String scoreText = String.format("%.1f", clampedScore);
        FontMetrics fm = g2.getFontMetrics();
        int textWidth = fm.stringWidth(scoreText);
        g2.drawString(scoreText, cx - textWidth / 2, cy - 10);

        // Subtitle
        g2.setColor(new Color(100, 116, 139));
        g2.setFont(new Font("SansSerif", Font.PLAIN, 12));
        String label = "RISK INDEX (0-100)";
        FontMetrics fm2 = g2.getFontMetrics();
        g2.drawString(label, cx - fm2.stringWidth(label) / 2, cy + 15);

        g2.dispose();

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            byte[] bytes = baos.toByteArray();
            Image pdfImage = new Image(ImageDataFactory.create(bytes));
            pdfImage.setAutoScale(true);
            return pdfImage;
        } catch (IOException e) {
            throw new RuntimeException("Failed to render risk gauge image", e);
        }
    }
}
