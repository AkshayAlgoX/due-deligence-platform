package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropertyResponse {

    private Long id;

    private String address;

    private String city;

    private String state;

    private String zipCode;

    private String propertyType;

    private Double area;

    private Double marketValue;

}