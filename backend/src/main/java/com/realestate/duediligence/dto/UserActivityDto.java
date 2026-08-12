package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserActivityDto {
    private int dayOfWeek; // 0=Sunday ... 6=Saturday
    private int hourOfDay; // 0-23
    private long count;
}