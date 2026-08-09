package com.realestate.duediligence.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.realestate.duediligence.service.impl.CustomUserDetailsService;

import lombok.RequiredArgsConstructor;

/**
 * SecurityConfig — the security backbone.
 *
 * Key decisions:
 *  - Stateless (JWT only, no server sessions)
 *  - CSRF disabled (JWT doesn't need it)
 *  - Method-level security ENABLED (@PreAuthorize now works)
 *  - CORS whitelist for localhost:3000 (dev frontend)
 *  - Clean 401/403 JSON responses (no HTML error pages)
 */
@Configuration
@EnableMethodSecurity  // ← CRITICAL: activates @PreAuthorize on methods
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitFilter rateLimitFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            // ── NEW: Security headers (protects against XSS, clickjacking, MIME sniffing) ──
            .headers(headers -> headers
                .frameOptions(frame -> frame.deny())                          // X-Frame-Options: DENY (no clickjacking)
                .contentTypeOptions(opts -> {})                               // X-Content-Type-Options: nosniff
                .httpStrictTransportSecurity(hsts -> hsts                     // HSTS for HTTPS enforcement
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000)                                // 1 year
                )
                .referrerPolicy(ref -> ref.policy(
                    org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN
                ))
                .contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'self'; " +
                    "img-src 'self' data: https:; " +
                    "script-src 'self' 'unsafe-inline' https://accounts.google.com; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "connect-src 'self' http://localhost:8080 https://accounts.google.com; " +
                    "frame-src https://accounts.google.com"
                ))
            )

            // Enable CORS with our custom config
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth
                // ── Public endpoints (auth flow) ──────────────────────
                .requestMatchers(
    "/api/auth/register/**",
    "/api/auth/login",
    "/api/auth/google",
    "/api/auth/complete-google-signup",
    "/api/auth/forgot-password",
    "/api/auth/verify-otp",
    "/api/auth/reset-password",

    // Swagger
    "/swagger-ui.html",
    "/swagger-ui/**",
    "/v3/api-docs",
    "/v3/api-docs/**",
    "/v3/api-docs.yaml",
    "/swagger-resources/**",
    "/webjars/**",

    // ── Actuator health + info (safe to be public) ──
    "/actuator/health",
    "/actuator/health/**",
    "/actuator/info",

    // ── SSE: EventSource cannot send Authorization headers.
    //    The JWT filter still runs on this endpoint — the controller
    //    checks auth.getName() and returns 401 if not authenticated.
    //    We permit here only to avoid Spring Security rejecting it
    //    before the JWT filter has a chance to set the context.
    "/api/sse/notifications"
).permitAll()

                .requestMatchers("/error").permitAll()

                // Preflight OPTIONS for CORS
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ── Role-gated endpoints ──────────────────────────────
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/buyer/**").hasRole("BUYER")
                .requestMatchers("/api/agent/**").hasRole("REAL_ESTATE_AGENT")
                .requestMatchers("/api/legal/**").hasRole("LEGAL_REVIEWER")
                .requestMatchers("/api/financial/**").hasRole("FINANCIAL_INSTITUTION")

                // ── Export endpoints ──────────────────────────────────
                .requestMatchers("/api/export/**").authenticated()

                // ── Everything else: authenticated ────────────────────
                .anyRequest().authenticated()
            )

            // Custom 401/403 responses in clean JSON (no HTML)
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write(
                        "{\"success\":false,\"message\":\"Authentication required\",\"status\":401}"
                    );
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpStatus.FORBIDDEN.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write(
                        "{\"success\":false,\"message\":\"Access denied - insufficient permissions\",\"status\":403}"
                    );
                })
            )

            .userDetailsService(customUserDetailsService)

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            )

            // Rate limiter runs BEFORE JWT filter — rejects flooding
            // requests before any expensive auth work is done
            .addFilterBefore(
                rateLimitFilter,
                JwtAuthenticationFilter.class
            );

        return http.build();
    }

    /**
     * CORS whitelist — only allow trusted frontend origins.
     *
     * Production TODO: add your deployed frontend URL here (e.g. "https://yourdomain.com")
     * Never use "*" — that defeats the purpose of CORS.
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();

        // Frontend origins (dev + future prod)
        cors.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://localhost:3001"  // sometimes Next.js falls back to 3001
            // "https://your-production-domain.com"  // uncomment when deploying
        ));

        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cors.setAllowedHeaders(List.of("*"));
        cors.setExposedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));
        cors.setAllowCredentials(true);
        cors.setMaxAge(3600L);  // cache preflight 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
