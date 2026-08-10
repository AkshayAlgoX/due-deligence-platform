package com.realestate.duediligence.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.ExportHistory;

@Repository
public interface ExportHistoryRepository extends JpaRepository<ExportHistory, Long> {

    Page<ExportHistory> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

}