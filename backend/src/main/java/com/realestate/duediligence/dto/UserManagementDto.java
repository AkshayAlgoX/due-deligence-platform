package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserManagementDto {
    private Long id;
    private String fullName;
    private String email;
    private String role;
    private Boolean isActive;
    private Boolean isBanned;
    private LocalDateTime createdAt;
}