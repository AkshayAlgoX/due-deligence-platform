package com.realestate.duediligence.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "properties",
    indexes = {
        @Index(name = "idx_property_created_by", columnList = "created_by"),
        @Index(name = "idx_property_city", columnList = "city"),
        @Index(name = "idx_property_verified", columnList = "verified"),
        @Index(name = "idx_property_type", columnList = "property_type"),
        @Index(name = "idx_property_zip", columnList = "zip_code")
    }
)
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

    @Column(nullable = true)
    private String state;

    @Column(name = "zip_code", nullable = true)
    private String zipCode;

    @Column
    private String propertyType;

    @Column
    private Double area;

    @Column
    private Double marketValue;

    @Column(name = "year_built")
    private Integer yearBuilt;

    @Column(name = "lot_size")
    private Double lotSize;

    @Column
    private String zoning;

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
    private String structureType;

    @Column
    private String condition;

    // ── NEW: cascade delete when user is deleted ─────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

        // ── Milestone 3: Risk Assessment + Reports ──────────────────────
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private List<RiskAssessment> riskAssessments = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private List<DueDiligenceReport> reports = new ArrayList<>();
}