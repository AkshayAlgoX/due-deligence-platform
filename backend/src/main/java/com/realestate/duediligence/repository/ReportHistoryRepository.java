package com.realestate.duediligence.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.ReportHistory;

public interface ReportHistoryRepository extends JpaRepository<ReportHistory, Long> {

    List<ReportHistory> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);

    List<ReportHistory> findByReportIdOrderByVersionDesc(String reportId);
}