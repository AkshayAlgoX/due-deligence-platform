package com.realestate.duediligence.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    @GetMapping("/dashboard")
    public String dashboard() {
        return "Welcome Real Estate Agent!";
    }

}