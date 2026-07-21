package com.realestate.duediligence.config;

import java.util.concurrent.Executor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * Thread pool for parallel integration calls.
 *
 * Sized for 6 concurrent providers per request.
 * Bounded queue prevents runaway memory on request spikes.
 */
@Configuration
@EnableAsync
public class IntegrationConfig {

    @Bean(name = "integrationExecutor")
    public Executor integrationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(12);
        executor.setMaxPoolSize(24);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("integration-");
        executor.setKeepAliveSeconds(60);
        executor.initialize();
        return executor;
    }
}