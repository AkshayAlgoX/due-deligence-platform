package com.realestate.duediligence.integration.permit;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermitRecord {
    private String permitType;            // BUILDING, OCCUPANCY, RENOVATION, COMMERCIAL
    private String permitNumber;
    private String status;                // APPROVED, PENDING, EXPIRED, REJECTED
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String issuingAuthority;      // BBMP, MCGM etc.
    private String description;
}