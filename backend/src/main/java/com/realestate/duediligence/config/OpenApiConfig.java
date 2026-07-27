package com.realestate.duediligence.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger configuration.
 *
 * Access:
 *   - Docs UI:  http://localhost:8080/swagger-ui.html
 *   - JSON:     http://localhost:8080/v3/api-docs
 *
 * Design decisions:
 *  - JWT bearer auth pre-configured in the "Authorize" button
 *  - All endpoints require auth by default (matches SecurityConfig)
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Real Estate Due Diligence API")
                .version("1.0.0")
                .description("""
                    Backend API for the Real Estate Due Diligence platform.
                    
                    Features:
                    - JWT authentication with Google SSO support
                    - Property management with per-user data isolation
                    - Multi-source aggregation (6 providers)
                    - Rule-based risk scoring
                    - PDF report generation
                    - Role-based access control (5 roles)
                    """)
                .contact(new Contact()
                    .name("Akshaya R")
                    .email("akshaya@example.com"))
                .license(new License()
                    .name("Internal Use Only")))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Paste your JWT token here (no 'Bearer ' prefix)")));
    }
}