package com.realestate.duediligence.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.Subscription;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findFirstByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Subscription> findByCashfreeOrderId(String orderId);

    Optional<Subscription> findFirstByUserIdAndStatus(Long userId, String status);

    List<Subscription> findTop6ByUserIdOrderByCreatedAtDesc(Long userId);

    long countByUserIdAndCreatedAtAfter(Long userId, LocalDateTime since);

    List<Subscription> findByStatusAndExpiresAtBefore(String status, LocalDateTime before);
}
