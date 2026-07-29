package com.realestate.duediligence.repository;

import com.realestate.duediligence.entity.SavedComparison;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedComparisonRepository extends JpaRepository<SavedComparison, Long> {

    List<SavedComparison> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<SavedComparison> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndName(Long userId, String name);
}