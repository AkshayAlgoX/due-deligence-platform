package com.realestate.duediligence.templates.pdf;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

import javax.imageio.ImageIO;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.layout.element.Image;

public class ChartImageRenderer {

    public static Image convertBase64ToImage(String base64Data) {
        if (base64Data == null || base64Data.isBlank()) {
            return generatePlaceholderChart("Chart Data Not Available", 500, 220);
        }

        try {
            String cleanData = base64Data;
            if (base64Data.contains(",")) {
                cleanData = base64Data.split(",")[1];
            }
            byte[] bytes = Base64.getDecoder().decode(cleanData.trim());
            Image image = new Image(ImageDataFactory.create(bytes));
            image.setAutoScale(true);
            return image;
        } catch (Exception e) {
            return generatePlaceholderChart("Chart Image Error", 500, 220);
        }
    }

    public static Image generatePlaceholderChart(String title, int width, int height) {
        BufferedImage bufferedImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2 = bufferedImage.createGraphics();

        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Background
        g2.setColor(new Color(248, 250, 252));
        g2.fillRect(0, 0, width, height);

        // Border
        g2.setColor(new Color(226, 232, 240));
        g2.drawRect(0, 0, width - 1, height - 1);

        // Title
        g2.setColor(new Color(30, 41, 59));
        g2.setFont(new Font("SansSerif", Font.BOLD, 14));
        g2.drawString(title, 20, 30);

        // Simulated Bar / Line Chart Graphic
        g2.setColor(new Color(14, 165, 233, 180));
        int[] xPoints = {40, 100, 160, 220, 280, 340, 400, 460};
        int[] yPoints = {160, 120, 140, 80, 110, 60, 90, 70};

        g2.setStroke(new BasicStroke(3f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        for (int i = 0; i < xPoints.length - 1; i++) {
            g2.drawLine(xPoints[i], yPoints[i], xPoints[i + 1], yPoints[i + 1]);
            g2.fillOval(xPoints[i] - 4, yPoints[i] - 4, 8, 8);
        }
        g2.fillOval(xPoints[xPoints.length - 1] - 4, yPoints[xPoints.length - 1] - 4, 8, 8);

        g2.dispose();

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(bufferedImage, "png", baos);
            Image image = new Image(ImageDataFactory.create(baos.toByteArray()));
            image.setAutoScale(true);
            return image;
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate chart image", e);
        }
    }
}
