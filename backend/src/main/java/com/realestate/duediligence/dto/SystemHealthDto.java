package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SystemHealthDto {
    private String dbStatus;
    private String apiStatus;
    private long uptimeSeconds;
}