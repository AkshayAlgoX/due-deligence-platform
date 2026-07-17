package com.realestate.duediligence.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "properties")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String zipCode;

    @Column
    private String propertyType;

    @Column
    private Double area;

    @Column
    private Double marketValue;

    // ── NEW FIELDS ─────────────────────────────────────────────────
    @Column(name = "year_built")
    private Integer yearBuilt;

    @Column(name = "lot_size")
    private Double lotSize;              // in acres

    @Column
    private String zoning;               // e.g., "R-1", "C-2"

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column
    private Boolean verified = false;

    @Column
    private Integer bedrooms;

    @Column
    private Integer bathrooms;

    @Column
    private Integer stories;

    @Column(name = "structure_type")
    private String structureType;        // e.g., "Wood Frame", "Concrete"

    @Column
    private String condition;            // e.g., "Excellent", "Good"
    // ── END NEW FIELDS ─────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Auto-set timestamps
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.verified == null) this.verified = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}