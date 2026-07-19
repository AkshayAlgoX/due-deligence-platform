package com.realestate.duediligence.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeleteAccountRequest {

    @NotBlank(message = "Password confirmation is required")
    private String password;

    @NotBlank(message = "Please type DELETE to confirm")
    private String confirmation;
}