package com.realestate.duediligence;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class DueDiligenceAgentApplication {

	public static void main(String[] args) {
		SpringApplication.run(DueDiligenceAgentApplication.class, args);
	}
    
}
