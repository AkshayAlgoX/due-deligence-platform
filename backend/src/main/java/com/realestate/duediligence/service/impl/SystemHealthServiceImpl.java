package com.realestate.duediligence.service.impl;

import java.time.Duration;
import java.time.Instant;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.SystemHealthDto;
import com.realestate.duediligence.service.SystemHealthService;

@Service
public class SystemHealthServiceImpl implements SystemHealthService {

    private final DataSource dataSource;
    private final Instant startTime = Instant.now();

    @Autowired
    public SystemHealthServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public SystemHealthDto getSystemHealth() {
        String dbStatus = checkDbConnection();
        String apiStatus = "UP";
        long uptimeSeconds = Duration.between(startTime, Instant.now()).getSeconds();
        return new SystemHealthDto(dbStatus, apiStatus, uptimeSeconds);
    }

    private String checkDbConnection() {
        try (var connection = dataSource.getConnection()) {
            return connection.isValid(2) ? "UP" : "DOWN";
        } catch (Exception e) {
            return "DOWN";
        }
    }
}