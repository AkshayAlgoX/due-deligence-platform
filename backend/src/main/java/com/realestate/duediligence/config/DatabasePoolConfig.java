package com.realestate.duediligence.config;

import com.zaxxer.hikari.HikariDataSource;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.autoconfigure.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class DatabasePoolConfig {

    /**
     * Explicit HikariCP datasource configuration.
     *
     * DataSourceProperties supplies:
     * - JDBC URL
     * - username
     * - password
     * - driver information
     *
     * Hikari-specific values are bound from:
     * spring.datasource.hikari.*
     *
     * This keeps the credentials in application.properties/.env
     * instead of hard-coding them in Java.
     */
    @Bean
    @ConfigurationProperties("spring.datasource.hikari")
    public HikariDataSource dataSource(
            DataSourceProperties dataSourceProperties) {

        return dataSourceProperties
                .initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
    }
}
