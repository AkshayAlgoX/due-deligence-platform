package com.realestate.duediligence.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


import com.realestate.duediligence.dto.ReportHistoryDto;
import com.realestate.duediligence.entity.ReportHistory;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.entity.AuditLog;
import com.realestate.duediligence.enums.AuditAction;
import com.realestate.duediligence.repository.ReportHistoryRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.service.EmailService;
import com.realestate.duediligence.service.ReportHistoryService;
import com.realestate.duediligence.service.AuditLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportHistoryServiceImpl implements ReportHistoryService {

    private final ReportHistoryRepository repository;
    private final EmailService emailService;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    @Override
    public ReportHistory save(ReportHistory reportHistory) {

    ReportHistory saved = repository.save(reportHistory);

    saveAuditLog(
            resolveCurrentUser(),
            AuditAction.REPORT_GENERATED,
            "REPORT",
            saved.getId(),
            "Report generated"
    );

    return saved;
}

    @Override
    public List<ReportHistoryDto> getAllReports() {
        return repository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ReportHistoryDto getReport(Long id) {

        ReportHistory report = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        return toDto(report);
    }

    @Override
    public List<ReportHistoryDto> getReports(Long propertyId) {

        if (propertyId == null) {
            return getAllReports();
        }

        return repository.findByPropertyIdOrderByCreatedAtDesc(propertyId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReportHistoryDto> getVersions(String reportId) {

        return repository.findByReportIdOrderByVersionDesc(reportId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void archive(Long id) {

        ReportHistory report = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setIsArchived(true);

        repository.save(report);

        saveAuditLog(
        resolveCurrentUser(),
        AuditAction.REPORT_GENERATED,   // or REPORT_ARCHIVED if available
        "REPORT",
        report.getId(),
        "Report archived"
       );
    }

    @Override
    public void share(Long id, String email) {

        ReportHistory report = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        emailService.sendWelcomeEmail(
                email,
                "Report " + report.getReportId()
        );

        saveAuditLog(
        resolveCurrentUser(),
        AuditAction.REPORT_GENERATED,   // or REPORT_SHARED if available
        "REPORT",
        report.getId(),
        "Report shared to " + email
    );
    }

    private ReportHistoryDto toDto(ReportHistory report) {

        ReportHistoryDto dto = new ReportHistoryDto();

        dto.setId(report.getId());

        if (report.getProperty() != null) {
            dto.setPropertyId(report.getProperty().getId());
            dto.setPropertyTitle(report.getProperty().getAddress());
        }

        if (report.getUser() != null) {
            dto.setUserId(report.getUser().getId());
            dto.setGeneratedBy(report.getUser().getFullName());
        }

        dto.setReportType(report.getReportId());
        dto.setFileName(report.getFilePath());
        dto.setStatus(Boolean.TRUE.equals(report.getIsArchived())
                ? "ARCHIVED"
                : "ACTIVE");

        dto.setCreatedAt(report.getCreatedAt());

        return dto;
    }

    private User resolveCurrentUser() {

    Authentication auth =
            SecurityContextHolder.getContext().getAuthentication();

    if (auth == null || !auth.isAuthenticated()) {
        return null;
    }

    return userRepository.findByEmail(auth.getName()).orElse(null);
}

    private void saveAuditLog(
        User user,
        AuditAction action,
        String resourceType,
        Long resourceId,
        String details) {

    if (user == null) {
        return;
    }

    AuditLog log = new AuditLog();

    log.setUser(user);
    log.setAction(action);
    log.setResourceType(resourceType);
    log.setResourceId(resourceId);
    log.setDetailsJson(details);
    log.setCreatedAt(LocalDateTime.now());

    auditLogService.save(log);
}}