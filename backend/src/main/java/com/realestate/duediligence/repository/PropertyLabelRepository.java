package com.realestate.duediligence.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.PropertyLabel;
import com.realestate.duediligence.enums.LabelType;

@Repository
public interface PropertyLabelRepository extends JpaRepository<PropertyLabel, Long> {

    List<PropertyLabel> findByPropertyId(Long propertyId);

    Optional<PropertyLabel> findByPropertyIdAndType(Long propertyId, LabelType type);

    @Query("SELECT pl FROM PropertyLabel pl WHERE pl.property.id IN :propertyIds")
    List<PropertyLabel> findByPropertyIdIn(@Param("propertyIds") List<Long> propertyIds);

    @Modifying
    @Query("DELETE FROM PropertyLabel pl WHERE pl.expiresAt IS NOT NULL AND pl.expiresAt < :now")
    int deleteExpiredLabels(@Param("now") LocalDateTime now);

    @Modifying
    @Query("DELETE FROM PropertyLabel pl WHERE pl.property.id = :propertyId AND pl.type = :type")
    int deleteByPropertyIdAndType(@Param("propertyId") Long propertyId, @Param("type") LabelType type);

    boolean existsByPropertyIdAndType(Long propertyId, LabelType type);
}