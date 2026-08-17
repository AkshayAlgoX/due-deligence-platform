package com.realestate.duediligence.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realestate.duediligence.entity.ExportHistory;

@Repository
public interface ExportHistoryRepository
        extends JpaRepository<ExportHistory, Long> {

    /**
     * Export history is already stored with userId as a scalar column,
     * not as a lazy @ManyToOne User relationship.
     *
     * Therefore JOIN FETCH is not applicable here.
     *
     * The matching composite database index is added in V20:
     * (user_id, created_at DESC)
     */
    Page<ExportHistory> findByUserIdOrderByCreatedAtDesc(
            Long userId,
            Pageable pageable);
}
