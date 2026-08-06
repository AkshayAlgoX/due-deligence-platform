// backend/src/main/java/com/realestate/duediligence/config/AsyncConfig.java
package com.realestate.duediligence.config;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.task.DelegatingSecurityContextAsyncTaskExecutor;

/**
 * Enables @Async processing for report generation.
 *
 * Wraps the underlying executor with DelegatingSecurityContextAsyncTaskExecutor
 * so that Spring Security's SecurityContext (JWT authentication) propagates
 * from the request thread into the async worker thread.
 *
 * WITHOUT this, SecurityContextHolder.getContext().getAuthentication() returns
 * null in the async thread, causing PropertyAggregationService's ownership
 * check to fail with "Property not found".
 *
 * This is the enterprise pattern used by Spring Security docs & Netflix.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean("reportTaskExecutor")
    public Executor reportTaskExecutor() {
        ThreadPoolTaskExecutor delegate = new ThreadPoolTaskExecutor();
        delegate.setCorePoolSize(3);
        delegate.setMaxPoolSize(5);
        delegate.setQueueCapacity(20);
        delegate.setThreadNamePrefix("reports-");
        delegate.setKeepAliveSeconds(60);
        delegate.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        delegate.initialize();

        // Wrap in security-context-aware executor
        return new DelegatingSecurityContextAsyncTaskExecutor(delegate);
    }
}