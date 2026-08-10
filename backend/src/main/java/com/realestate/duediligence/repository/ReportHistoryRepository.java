package com.realestate.duediligence.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.ReportHistory;

public interface ReportHistoryRepository extends JpaRepository<ReportHistory, Long> {

    List<ReportHistory> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);

    List<ReportHistory> findByReportIdOrderByVersionDesc(String reportId);

    Optional<ReportHistory> findFirstByReportIdOrderByVersionDesc(String reportId);

    boolean existsByReportId(String reportId);
}