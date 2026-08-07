package com.realestate.duediligence.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.ReportSection;

@Repository
public interface ReportSectionRepository extends JpaRepository<ReportSection, Long> {

    List<ReportSection> findByReportIdOrderByOrderIndexAsc(Long reportId);

    Optional<ReportSection> findByReportIdAndSectionType(Long reportId, String sectionType);

    void deleteByReportId(Long reportId);
}