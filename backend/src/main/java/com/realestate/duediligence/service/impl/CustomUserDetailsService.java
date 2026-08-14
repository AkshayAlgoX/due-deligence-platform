package com.realestate.duediligence.service.impl;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        // Legacy rows created before the is_active column existed have NULL in
        // the DB (ddl-auto=update doesn't backfill). Entity default is "active",
        // so treat NULL as active — disable only on an explicit false.
        boolean active = !Boolean.FALSE.equals(user.getIsActive());
        boolean banned = Boolean.TRUE.equals(user.getIsBanned());

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword() == null ? "" : user.getPassword())
                .roles(user.getRole().getRoleName().name())
                .disabled(!active || banned)
                .build();
    }
}