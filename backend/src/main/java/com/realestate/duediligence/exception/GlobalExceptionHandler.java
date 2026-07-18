package com.realestate.duediligence.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.EntityNotFoundException;

/**
 * GlobalExceptionHandler — the last line of defence.
 *
 * Design principles:
 *  - Never leak stack traces to clients
 *  - Always return clean JSON
 *  - Log everything server-side for debugging
 *  - Use proper HTTP status codes
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ── 400: Bad Request — validation failures ────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        return buildResponse(
            HttpStatus.BAD_REQUEST,
            "Validation failed",
            Map.of("errors", fieldErrors)
        );
    }

    // ── 400: Bad Request — malformed JSON / bad arg types ─────────────
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), null);
    }

    // ── 401: Unauthorized — bad credentials ───────────────────────────
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Bad credentials attempt: {}", ex.getMessage());
        return buildResponse(
            HttpStatus.UNAUTHORIZED,
            "Invalid email or password",
            null
        );
    }

    // ── 401: Unauthorized — token issues ──────────────────────────────
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthentication(AuthenticationException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        return buildResponse(
            HttpStatus.UNAUTHORIZED,
            "Authentication required",
            null
        );
    }

    // ── 403: Forbidden — role-based access denied ─────────────────────
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return buildResponse(
            HttpStatus.FORBIDDEN,
            "You don't have permission to perform this action",
            null
        );
    }

    // ── 404: Not Found ────────────────────────────────────────────────
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEntityNotFound(EntityNotFoundException ex) {
        log.warn("Entity not found: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), null);
    }

    // ── 500: Runtime exceptions (business logic errors) ───────────────
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        log.error("Runtime exception: {}", ex.getMessage(), ex);
        return buildResponse(
            HttpStatus.INTERNAL_SERVER_ERROR,
            ex.getMessage() != null ? ex.getMessage() : "Something went wrong",
            null
        );
    }

    // ── 500: Catch-all for anything unexpected ────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        // Full stack trace goes to server logs, NEVER to client
        log.error("Unhandled exception:", ex);
        return buildResponse(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "An unexpected error occurred. Please try again later.",
            null
        );
    }

    // ── Helper: build consistent JSON response ────────────────────────
    private ResponseEntity<Map<String, Object>> buildResponse(
            HttpStatus status, String message, Map<String, Object> extras) {

        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("status", status.value());
        body.put("message", message);
        body.put("timestamp", LocalDateTime.now().toString());

        if (extras != null) {
            body.putAll(extras);
        }

        return new ResponseEntity<>(body, status);
    }
}