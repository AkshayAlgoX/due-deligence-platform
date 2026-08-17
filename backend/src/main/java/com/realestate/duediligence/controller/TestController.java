package com.realestate.duediligence.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Internal Test",
        description = "Internal smoke-test endpoint to verify JWT authentication and ADMIN role enforcement. " +
                "Not intended for production use.")
public class TestController {

    @GetMapping
    @Operation(
            summary = "JWT authentication smoke test",
            description = "Returns a success string if the request contains a valid JWT with ROLE_ADMIN. " +
                    "Used during development to verify the security filter chain is working.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "JWT is valid and user has ADMIN role"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token"),
            @ApiResponse(responseCode = "403", description = "Authenticated user is not ADMIN")
    })
    public String test() {
        return "JWT Authentication Successful!";
    }
}
