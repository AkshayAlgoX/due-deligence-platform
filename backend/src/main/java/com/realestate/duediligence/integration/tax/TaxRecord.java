package com.realestate.duediligence.integration.tax;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxRecord {
    private Integer assessmentYear;
    private Double assessedValue;
    private Double taxAmount;
    private String status;          // PAID, PENDING, OVERDUE
    private String receiptNumber;
    private LocalDate paidDate;
    private LocalDate dueDate;
    private String municipality;    // BBMP, MCGM, MCD etc.
}