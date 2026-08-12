package com.realestate.duediligence.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Request body for POST /api/contact/submit. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactSubmitRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @Size(max = 150, message = "Company must not exceed 150 characters")
    private String company;

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotBlank(message = "Message is required")
    @Size(max = 3000, message = "Message must not exceed 3000 characters")
    private String message;
}
