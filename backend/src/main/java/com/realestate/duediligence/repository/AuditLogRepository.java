package com.realestate.duediligence.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.AuditLog;
import com.realestate.duediligence.enums.AuditAction;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUser_IdOrderByCreatedAtDesc(Long userId);

    List<AuditLog> findByResourceIdOrderByCreatedAtDesc(Long resourceId);

    List<AuditLog> findByAction(AuditAction action);

    List<AuditLog> findByCreatedAtBetween(
            LocalDateTime from,
            LocalDateTime to);

}