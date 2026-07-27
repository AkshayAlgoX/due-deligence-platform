package com.realestate.duediligence.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Provides the ObjectMapper bean used for serializing snapshot sections
 * (see PropertyAggregationService.persistSnapshot).
 *
 * Registers JavaTimeModule so Instant/LocalDate fields (e.g. in
 * EnvironmentalInfo, PermitRecord) serialize correctly instead of
 * throwing on unsupported types.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }
}