package com.realestate.duediligence.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import com.realestate.duediligence.entity.PropertyDueDiligenceSnapshot;

public interface PropertyDueDiligenceSnapshotRepository
        extends JpaRepository<PropertyDueDiligenceSnapshot, Long> {

    List<PropertyDueDiligenceSnapshot> findByProperty_IdOrderByCreatedAtDesc(Long propertyId);

    @Query("SELECT s FROM PropertyDueDiligenceSnapshot s " +
            "WHERE s.property.id = :propertyId " +
            "ORDER BY s.createdAt DESC")
    List<PropertyDueDiligenceSnapshot> findLatestFirst(@Param("propertyId") Long propertyId);
}
