package com.realestate.duediligence.service.impl;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.AuditLogDetailDto;
import com.realestate.duediligence.dto.AuditLogDto;
import com.realestate.duediligence.dto.AuditLogFilterRequest;
import com.realestate.duediligence.entity.AuditLog;
import com.realestate.duediligence.repository.AuditLogRepository;
import com.realestate.duediligence.service.AuditLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public AuditLog save(AuditLog auditLog) {
        return auditLogRepository.save(auditLog);
    }

    @Override
    public List<AuditLogDto> getAllLogs() {

        return auditLogRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public AuditLogDetailDto getLogById(Long id) {

        AuditLog log = auditLogRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Audit Log not found : " + id));

        AuditLogDetailDto dto = new AuditLogDetailDto();

        dto.setId(log.getId());

        if (log.getUser() != null) {
            dto.setUserId(log.getUser().getId());
            dto.setUserName(log.getUser().getFullName());
        }

        dto.setAction(log.getAction());
        dto.setEntityType(log.getResourceType());
        dto.setEntityId(log.getResourceId());

        // detailsJson is stored as TEXT.
        // Until before/after JSON parsing is added,
        // expose it in newValue.
        dto.setOldValue(null);
        dto.setNewValue(log.getDetailsJson());

        dto.setIpAddress(log.getIpAddress());
        dto.setUserAgent(log.getUserAgent());
        dto.setCreatedAt(log.getCreatedAt());

        return dto;
    }

    @Override
    public List<AuditLogDto> filterLogs(AuditLogFilterRequest request) {

        List<AuditLog> logs = auditLogRepository.findAll();

        return logs.stream()

                .filter(log -> request.getAction() == null
                        || log.getAction() == request.getAction())

                .filter(log -> request.getUserId() == null
                        || (log.getUser() != null
                        && log.getUser().getId().equals(request.getUserId())))

                .filter(log -> request.getEntityType() == null
                        || log.getResourceType().equalsIgnoreCase(request.getEntityType()))

                .filter(log -> request.getFromDate() == null
                        || !log.getCreatedAt().toLocalDate()
                        .isBefore(request.getFromDate()))

                .filter(log -> request.getToDate() == null
                        || !log.getCreatedAt().toLocalDate()
                        .isAfter(request.getToDate()))

                .map(this::convertToDto)

                .collect(Collectors.toList());
    }

    private AuditLogDto convertToDto(AuditLog log) {

    AuditLogDto dto = new AuditLogDto();

    dto.setId(log.getId());

    if (log.getUser() != null) {
        dto.setUserId(log.getUser().getId());
        dto.setUserName(log.getUser().getFullName());
    }

    dto.setAction(log.getAction());
    dto.setEntityType(log.getResourceType());
    dto.setEntityId(log.getResourceId());
    dto.setIpAddress(log.getIpAddress());
    dto.setCreatedAt(log.getCreatedAt());

    return dto;
}

@Override
public List<AuditLogDto> getLogsByUser(Long userId) {

    return auditLogRepository.findByUser_IdOrderByCreatedAtDesc(userId)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
}

@Override
public List<AuditLogDto> getLogsByProperty(Long propertyId) {

    return auditLogRepository.findByResourceIdOrderByCreatedAtDesc(propertyId)
            .stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
}

@Override
public byte[] exportLogs(AuditLogFilterRequest request, String format) {

    List<AuditLogDto> logs = filterLogs(request);

    StringBuilder csv = new StringBuilder();

    csv.append("Id,User,Action,Entity,EntityId,IP,CreatedAt\n");

    for (AuditLogDto log : logs) {

        csv.append(esc(log.getId())).append(",");
        csv.append(esc(log.getUserName())).append(",");
        csv.append(esc(log.getAction())).append(",");
        csv.append(esc(log.getEntityType())).append(",");
        csv.append(esc(log.getEntityId())).append(",");
        csv.append(esc(log.getIpAddress())).append(",");
        csv.append(esc(log.getCreatedAt())).append("\n");
    }

    return csv.toString().getBytes(StandardCharsets.UTF_8);
}

/** Null-safe CSV value escaper — quotes values containing commas, quotes, or newlines */
private static String esc(Object value) {
    if (value == null) return "";
    String s = value.toString();
    if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
        return "\"" + s.replace("\"", "\"\"") + "\"";
    }
    return s;
}

@Override
public Map<String, Object> getAuditStatistics() {

    List<AuditLog> logs = auditLogRepository.findAll();

    Map<String, Object> stats = new HashMap<>();

    stats.put("totalLogs", logs.size());

    stats.put(
            "loginEvents",
            logs.stream()
                    .filter(l -> l.getAction().name().equals("LOGIN"))
                    .count());

    stats.put(
            "reportGenerated",
            logs.stream()
                    .filter(l -> l.getAction().name().equals("REPORT_GENERATED"))
                    .count());

    stats.put(
            "propertyCreated",
            logs.stream()
                    .filter(l -> l.getAction().name().equals("PROPERTY_CREATED"))
                    .count());

    return stats;
}
}
