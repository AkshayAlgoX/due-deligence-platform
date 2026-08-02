package com.realestate.duediligence;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableCaching
@EnableRetry
@EnableScheduling
public class DueDiligenceAgentApplication {

    public static void main(String[] args) {
        SpringApplication.run(DueDiligenceAgentApplication.class, args);
    }

}