package com.realestate.duediligence.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.realestate.duediligence.entity.Role;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.RoleType;
import com.realestate.duediligence.repository.RoleRepository;
import com.realestate.duediligence.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

/**
 * Runs once at application startup.
 *
 * Responsibilities:
 *   1. Seed all 5 roles into the roles table (idempotent)
 *   2. Seed a single admin user from env config (idempotent — skips if exists)
 *
 * Admin credentials come from application properties, never hardcoded.
 * See .env or application.properties for `app.admin.*` values.
 */
@Slf4j
@Configuration
public class DataInitializer {

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.full-name}")
    private String adminFullName;

    @Value("${app.admin.phone-number}")
    private String adminPhoneNumber;

    @Bean
    CommandLineRunner initData(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            seedRoles(roleRepository);
            seedInitialAdmin(userRepository, roleRepository, passwordEncoder);
        };
    }

    // ── Seed all RoleType values into the roles table ───────────────────────
    private void seedRoles(RoleRepository roleRepository) {
        for (RoleType roleType : RoleType.values()) {
            if (roleRepository.findByRoleName(roleType).isEmpty()) {
                Role role = new Role();
                role.setRoleName(roleType);
                roleRepository.save(role);
                log.info("Seeded role: {}", roleType);
            }
        }
    }

    // ── Seed the initial admin user, and ensure its role is always ADMIN ────
private void seedInitialAdmin(
        UserRepository userRepository,
        RoleRepository roleRepository,
        PasswordEncoder passwordEncoder
) {
    // Fetch the ADMIN role (must exist because seedRoles ran first)
    Role adminRole = roleRepository.findByRoleName(RoleType.ADMIN)
            .orElseThrow(() -> new IllegalStateException(
                    "ADMIN role not found — role seeding must run before admin user seed."));

    java.util.Optional<User> existing = userRepository.findByEmail(adminEmail);

    if (existing.isPresent()) {
        User admin = existing.get();
        // Guard: if the stored role is not ADMIN (e.g. corrupted by a merge or
        // accidental role-change via UI), repair it silently on startup.
        if (admin.getRole() == null
                || admin.getRole().getRoleName() != RoleType.ADMIN) {
            admin.setRole(adminRole);
            userRepository.save(admin);
            log.warn("Admin user '{}' had wrong role — repaired to ADMIN.", adminEmail);
        } else {
            log.info("Admin user '{}' already exists with correct role — skipping seed.", adminEmail);
        }
        return;
    }

    User admin = new User();
    admin.setFullName(adminFullName);
    admin.setEmail(adminEmail);
    admin.setPassword(passwordEncoder.encode(adminPassword));
    admin.setPhoneNumber(adminPhoneNumber);
    admin.setRole(adminRole);
    admin.setAuthProvider("LOCAL");   // explicit — matches regular registration

    // Explicit timestamps in case entity doesn't auto-populate via @PrePersist
    java.time.LocalDateTime now = java.time.LocalDateTime.now();
    admin.setCreatedAt(now);
    admin.setUpdatedAt(now);

    userRepository.save(admin);

    log.info("═══════════════════════════════════════════════════");
    log.info("  Initial admin user created");
    log.info("  Email: {}", adminEmail);
    log.info("  Change password after first login!");
    log.info("═══════════════════════════════════════════════════");
}
}