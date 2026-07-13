package com.realestate.duediligence.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/buyer")
public class BuyerController {

    @GetMapping("/dashboard")
    public String dashboard() {
        return "Welcome Buyer!";
    }

}