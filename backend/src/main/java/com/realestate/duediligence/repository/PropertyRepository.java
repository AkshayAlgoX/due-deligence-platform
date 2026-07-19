package com.realestate.duediligence.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.realestate.duediligence.entity.Property;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    /**
     * Search across multiple fields (case-insensitive).
     */
    @Query("SELECT p FROM Property p WHERE " +
           "LOWER(p.address)      LIKE %:q% OR " +
           "LOWER(p.city)         LIKE %:q% OR " +
           "LOWER(p.state)        LIKE %:q% OR " +
           "LOWER(p.zipCode)      LIKE %:q% OR " +
           "LOWER(p.propertyType) LIKE %:q%")
    List<Property> searchByKeyword(@Param("q") String q);

    /**
     * NEW: Fetch the 5 most recently created properties.
     */
    List<Property> findTop5ByOrderByCreatedAtDesc();

    /**
     * NEW: Dashboard KPI counts.
     */
    long countByVerifiedTrue();

    long countByVerifiedFalse();
}