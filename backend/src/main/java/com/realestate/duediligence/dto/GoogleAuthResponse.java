package com.realestate.duediligence.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response from Google Sign-In endpoint.
 * 
 * Two cases:
 * 1. Existing user  → returns { status: "AUTHENTICATED", token: "jwt..." }
 * 2. New user       → returns { status: "PROFILE_INCOMPLETE", email, name }
 *                     Frontend then shows profile completion form.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthResponse {

    /** "AUTHENTICATED" (existing user) or "PROFILE_INCOMPLETE" (new user) */
    private String status;

    /** JWT token — only set when status = AUTHENTICATED */
    private String token;

    /** Email from Google — used to prefill profile completion form */
    private String email;

    /** Name from Google — used to prefill profile completion form */
    private String name;

    /** Profile picture from Google — used in UI */
    private String picture;
    
}