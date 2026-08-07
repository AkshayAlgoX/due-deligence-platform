package com.realestate.duediligence.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.ComparableAnalysis;

public interface ComparableAnalysisRepository extends JpaRepository<ComparableAnalysis, Long> {

    List<ComparableAnalysis> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);

    Optional<ComparableAnalysis> findFirstByPropertyIdOrderByCreatedAtDesc(Long propertyId);
}
