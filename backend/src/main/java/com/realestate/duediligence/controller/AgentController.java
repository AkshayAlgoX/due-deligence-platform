package com.realestate.duediligence.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agent")
@Tag(name = "Agent Role", description = "Role-scoped landing endpoint for Real Estate Agent users.")
public class AgentController {

    @GetMapping("/dashboard")
    @Operation(
            summary = "Agent dashboard welcome",
            description = "Returns a welcome string for authenticated Real Estate Agent users. " +
                    "Intended as a role-confirmation probe; real dashboard data is served by /api/dashboard/*.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Welcome message returned"),
            @ApiResponse(responseCode = "401", description = "Missing or invalid JWT token")
    })
    public String dashboard() {
        return "Welcome Real Estate Agent!";
    }
}
