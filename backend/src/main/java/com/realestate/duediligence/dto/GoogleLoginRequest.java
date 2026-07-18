package com.realestate.duediligence.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {

    /**
     * Google ID token (JWT) from frontend's Google Sign-In.
     * Backend verifies this token with Google's servers.
     */
    @NotBlank(message = "Google credential is required")
    private String credential;
}