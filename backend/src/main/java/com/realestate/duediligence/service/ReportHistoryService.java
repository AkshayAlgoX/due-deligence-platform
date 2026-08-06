package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.dto.ReportHistoryDto;
import com.realestate.duediligence.entity.ReportHistory;

public interface ReportHistoryService {

    ReportHistory save(ReportHistory reportHistory);

    List<ReportHistoryDto> getAllReports();

    ReportHistoryDto getReport(Long id);

    List<ReportHistoryDto> getReports(Long propertyId);

    List<ReportHistoryDto> getVersions(String reportId);

    void archive(Long id);

    void share(Long id, String email);
}