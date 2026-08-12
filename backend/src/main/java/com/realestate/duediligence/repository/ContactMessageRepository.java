package com.realestate.duediligence.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.ContactMessage;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
}
