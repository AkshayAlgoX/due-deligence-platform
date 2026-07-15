package com.realestate.duediligence.integration.impl;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.integration.AddressValidationService;

@Service
public class AddressValidationServiceImpl implements AddressValidationService {

    @Override
    public boolean validateAddress(String address) {

        /*
         * Placeholder implementation.
         *
         * Future implementation:
         * Google Maps API
         * Mapbox API
         * Government Property API
         */

        return address != null && !address.trim().isEmpty();

    }

}