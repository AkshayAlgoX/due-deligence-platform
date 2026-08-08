package com.realestate.duediligence.templates.pdf;

import java.util.List;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.realestate.duediligence.config.PdfConfig;

public class TableRenderer {

    public static Table createStyledTable(String[] headers, List<String[]> dataRows, float[] columnWidths) {
        Table table = new Table(UnitValue.createPercentArray(columnWidths))
                .useAllAvailableWidth()
                .setMarginTop(10f)
                .setMarginBottom(15f);

        // Header Row
        for (String header : headers) {
            Cell cell = new Cell()
                    .add(new Paragraph(header).setBold().setFontSize(10f).setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(PdfConfig.PRIMARY_COLOR)
                    .setPadding(8f)
                    .setTextAlignment(TextAlignment.LEFT);
            table.addHeaderCell(cell);
        }

        // Data Rows
        boolean alternate = false;
        DeviceRgb altBg = new DeviceRgb(241, 245, 249); // Slate 100

        for (String[] row : dataRows) {
            for (String val : row) {
                Cell cell = new Cell()
                        .add(new Paragraph(val != null ? val : "").setFontSize(9f).setFontColor(PdfConfig.TEXT_PRIMARY))
                        .setPadding(6f);

                if (alternate) {
                    cell.setBackgroundColor(altBg);
                }

                table.addCell(cell);
            }
            alternate = !alternate;
        }

        return table;
    }

    public static Table createKeyValueTable(List<String[]> pairs) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{35, 65}))
                .useAllAvailableWidth()
                .setMarginTop(10f)
                .setMarginBottom(15f);

        boolean alternate = false;
        DeviceRgb altBg = new DeviceRgb(248, 250, 252);

        for (String[] pair : pairs) {
            String key = pair.length > 0 ? pair[0] : "";
            String val = pair.length > 1 ? pair[1] : "";

            Cell keyCell = new Cell()
                    .add(new Paragraph(key).setBold().setFontSize(9.5f).setFontColor(PdfConfig.TEXT_PRIMARY))
                    .setPadding(6f);

            Cell valCell = new Cell()
                    .add(new Paragraph(val).setFontSize(9.5f).setFontColor(PdfConfig.TEXT_PRIMARY))
                    .setPadding(6f);

            if (alternate) {
                keyCell.setBackgroundColor(altBg);
                valCell.setBackgroundColor(altBg);
            }

            table.addCell(keyCell);
            table.addCell(valCell);
            alternate = !alternate;
        }

        return table;
    }
}
