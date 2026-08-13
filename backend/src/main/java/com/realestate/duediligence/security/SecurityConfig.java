package com.realestate.duediligence.security;

import java.util.List;

import jakarta.servlet.DispatcherType;
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

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitFilter rateLimitFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .headers(headers -> headers
                .frameOptions(frame -> frame.deny())
                .contentTypeOptions(opts -> {})
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000)
                )
                .referrerPolicy(ref -> ref.policy(
                    org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN
                ))
                .contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'self' blob:; " +
                    "img-src 'self' data: blob: https:; " +
                    "script-src 'self' 'unsafe-inline' blob: https://accounts.google.com; " +
                    "style-src 'self' 'unsafe-inline'; " +
                    "connect-src 'self' http://localhost:8080 https://accounts.google.com https://api.groq.com; " +
                    "frame-src https://accounts.google.com"
                ))
            )

            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth

                // ── Async + error re-dispatches ───────────────────────
                // SSE endpoints (SseEmitter) re-enter the security chain on
                // ASYNC/ERROR dispatches without a usable auth context. Without
                // this, AuthorizationFilter throws on the committed response and
                // the connection dies with "Network Error". The original REQUEST
                // dispatch is still fully secured below.
                .dispatcherTypeMatchers(DispatcherType.ASYNC, DispatcherType.ERROR).permitAll()

                // ── Public endpoints ──────────────────────────────────
                .requestMatchers(
                    "/api/auth/register/**",
                    "/api/auth/login",
                    "/api/auth/google",
                    "/api/auth/complete-google-signup",
                    "/api/auth/forgot-password",
                    "/api/auth/verify-otp",
                    "/api/auth/reset-password",

                    // Public marketing
                    "/api/contact/submit",

                    // Cashfree webhook — signature-verified inside controller
                    "/api/subscription/webhook",

                    // Swagger
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs",
                    "/v3/api-docs/**",
                    "/v3/api-docs.yaml",
                    "/swagger-resources/**",
                    "/webjars/**",

                    // Actuator
                    "/actuator/health",
                    "/actuator/health/**",
                    "/actuator/info",

                    // SSE notifications — JWT filter handles auth internally
                    "/api/sse/notifications"
                ).permitAll()

                .requestMatchers("/error").permitAll()

                // Preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ── Role-gated endpoints ──────────────────────────────
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/buyer/**").hasRole("BUYER")
                .requestMatchers("/api/legal/**").hasRole("LEGAL_REVIEWER")
                .requestMatchers("/api/financial/**").hasRole("FINANCIAL_INSTITUTION")

                // ── AI Agent chat — ALL authenticated users (any role) ─
                // MUST be before the old /api/agent/** role rule
                .requestMatchers("/api/agent/chat/**").authenticated()

                // ── Real estate agent role-gated routes ───────────────
                // Only non-chat /api/agent/** routes need REAL_ESTATE_AGENT role
                .requestMatchers("/api/agent/**").hasRole("REAL_ESTATE_AGENT")

                // ── Export endpoints ──────────────────────────────────
                .requestMatchers("/api/export/**").authenticated()

                // ── Everything else: authenticated ────────────────────
                .anyRequest().authenticated()
            )

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

            .addFilterBefore(
                rateLimitFilter,
                JwtAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();

        cors.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://localhost:3001"
        ));

        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cors.setAllowedHeaders(List.of("*"));

        // ⭐ Added: text/event-stream headers for SSE streaming to work cross-origin
        cors.setExposedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "Cache-Control",
            "X-Accel-Buffering",        // tells nginx not to buffer SSE
            "Transfer-Encoding"          // needed for chunked SSE responses
        ));

        cors.setAllowCredentials(true);
        cors.setMaxAge(3600L);

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