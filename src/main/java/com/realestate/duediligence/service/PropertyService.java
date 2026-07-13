package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.dto.PropertyRequest;
import com.realestate.duediligence.dto.PropertyResponse;

public interface PropertyService {

    PropertyResponse addProperty(PropertyRequest request);

    List<PropertyResponse> getAllProperties();

    PropertyResponse getPropertyById(Long id);

    List<PropertyResponse> searchByCity(String city);

}