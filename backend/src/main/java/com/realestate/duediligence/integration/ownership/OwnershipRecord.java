package com.realestate.duediligence.integration.ownership;

import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Ownership + registration record for a property.
 * Modeled after real Indian land registry document structure.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnershipRecord {

    /** Primary current owner. */
    private String currentOwner;

    /** Additional co-owners, if any. */
    private List<String> coOwners;

    /**
     * Type of ownership.
     * Examples: "FREEHOLD", "LEASEHOLD", "COOPERATIVE_SOCIETY", "POWER_OF_ATTORNEY"
     */
    private String ownershipType;

    /** Date the property was registered to current owner. */
    private LocalDate registrationDate;

    /** Registration number from sub-registrar office. */
    private String registrationNumber;

    /** Sub-registrar office where document was filed. */
    private String subRegistrarOffice;

    /** Registered value (may differ from market value). */
    private Double registeredValue;

    /** Stamp duty paid, in INR. */
    private Double stampDutyPaid;

    /** URL to registration document (nullable). */
    private String documentUrl;

    /** Chain of previous owners with transfer dates. */
    private List<PreviousOwner> ownershipHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PreviousOwner {
        private String ownerName;
        private LocalDate ownedFrom;
        private LocalDate ownedUntil;
        private String transferReason; // SALE, INHERITANCE, GIFT, PARTITION
    }
}