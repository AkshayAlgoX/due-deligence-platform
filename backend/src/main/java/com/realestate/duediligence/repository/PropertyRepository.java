package com.realestate.duediligence.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.Property;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByCityIgnoreCase(String city);

    List<Property> findByStateIgnoreCase(String state);

    List<Property> findByZipCode(String zipCode);

    List<Property> findByAddressContainingIgnoreCase(String address);

}