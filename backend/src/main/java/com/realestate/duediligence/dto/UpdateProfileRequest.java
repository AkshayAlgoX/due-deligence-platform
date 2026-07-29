package com.realestate.duediligence.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    /**
     * Optional — only updated if non-null.
     * Same rule as RegisterRequest (3-100 chars).
     */
    @Size(min = 3, max = 100, message = "Full name must be between 3 and 100 characters")
    @Pattern(
            regexp = "^[A-Za-zÀ-ÿ' .\\-]+$",
            message = "Full name can only contain letters, spaces, hyphens, apostrophes, and dots")
    private String fullName;

    /**
     * Optional — only updated if non-null.
     * Same rule as RegisterRequest: valid 10-digit Indian mobile.
     */
    @Pattern(
            regexp = "^[6-9]\\d{9}$",
            message = "Phone number must be a valid 10-digit Indian mobile number")
    private String phoneNumber;

    /**
     * Optional — Cloudinary secure URL of user's profile picture.
     * Pass empty string ("") to remove existing photo.
     * Pass null to leave unchanged.
     */
    @Size(max = 500, message = "Profile picture URL cannot exceed 500 characters")
    private String profilePicture;
}