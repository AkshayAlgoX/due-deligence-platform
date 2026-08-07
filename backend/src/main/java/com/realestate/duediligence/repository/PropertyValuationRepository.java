package com.realestate.duediligence.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.PropertyValuation;
import com.realestate.duediligence.enums.ValuationMethod;

public interface PropertyValuationRepository extends JpaRepository<PropertyValuation, Long> {

    List<PropertyValuation> findByPropertyIdOrderByCalculatedAtDesc(Long propertyId);

    Optional<PropertyValuation> findFirstByPropertyIdOrderByCalculatedAtDesc(Long propertyId);

    Optional<PropertyValuation> findFirstByPropertyIdAndMethodOrderByCalculatedAtDesc(
            Long propertyId, ValuationMethod method);
}
