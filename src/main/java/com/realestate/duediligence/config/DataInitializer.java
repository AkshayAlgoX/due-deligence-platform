package com.realestate.duediligence.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.realestate.duediligence.entity.Role;
import com.realestate.duediligence.enums.RoleType;
import com.realestate.duediligence.repository.RoleRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner loadRoles(RoleRepository roleRepository) {

        return args -> {

            for (RoleType roleType : RoleType.values()) {

                if (roleRepository.findByRoleName(roleType).isEmpty()) {

                    Role role = new Role();
                    role.setRoleName(roleType);

                    roleRepository.save(role);
                }

            }

        };

    }

}