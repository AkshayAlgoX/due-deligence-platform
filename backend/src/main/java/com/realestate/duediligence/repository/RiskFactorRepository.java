package com.realestate.duediligence.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.RiskFactor;
import com.realestate.duediligence.enums.RiskCategory;

@Repository
public interface RiskFactorRepository extends JpaRepository<RiskFactor, Long> {

    List<RiskFactor> findByRiskAssessmentId(Long riskAssessmentId);

    List<RiskFactor> findByRiskAssessmentIdAndCategory(Long riskAssessmentId, RiskCategory category);

    void deleteByRiskAssessmentId(Long riskAssessmentId);
}