package com.realestate.duediligence.service;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import lombok.extern.slf4j.Slf4j;

/**
 * Verifies Google ID tokens received from the frontend.
 *
 * How it works:
 * 1. Frontend gets ID token from Google Sign-In popup
 * 2. Frontend sends token to backend
 * 3. This service verifies the token with Google's servers
 * 4. If valid → returns payload (email, name, picture, etc.)
 */
@Slf4j
@Service
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(@Value("${google.oauth.client-id}") String clientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(clientId))
                .build();

        log.info("🔐 Google Token Verifier initialized for client: {}",
                clientId.substring(0, Math.min(20, clientId.length())) + "...");
    }

    /**
     * Verify a Google ID token and return its payload.
     * @throws IllegalArgumentException if token is invalid or expired
     */
    public Payload verify(String idTokenString) {
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid Google token");
            }
            return idToken.getPayload();
        } catch (Exception e) {
            log.error("❌ Google token verification failed: {}", e.getMessage());
            throw new IllegalArgumentException("Google token verification failed: " + e.getMessage());
        }
    }
}