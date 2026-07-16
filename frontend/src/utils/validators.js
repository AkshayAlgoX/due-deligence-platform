import { PASSWORD_MIN_LENGTH } from "@/constants/appConstants";

/** Returns true if the string is a valid email address. */
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/** Returns true if the password meets the minimum length requirement (8 chars — backend enforced). */
export const isValidPassword = (password) =>
  password.length >= PASSWORD_MIN_LENGTH;

/**
 * Validates a 10-digit Indian mobile number (starts with 6–9).
 * Matches backend regex: ^[6-9]\d{9}$
 */
export const isValidIndianPhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone.trim());

/**
 * Validates the registration form fields.
 * Field names match the backend RegisterRequest DTO exactly:
 *   fullName, email, password, phoneNumber, role
 *
 * @param {{ fullName, email, password, confirmPassword, phoneNumber, role }} fields
 * @returns {Object} errors — empty object means form is valid
 */
export const validateRegisterForm = ({
  fullName,
  email,
  password,
  confirmPassword,
  phoneNumber,
  role,
}) => {
  const errors = {};

  // fullName — backend: @NotBlank, @Size(min=3, max=100)
  if (!fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (fullName.trim().length < 3) {
    errors.fullName = "Full name must be at least 3 characters.";
  } else if (fullName.trim().length > 100) {
    errors.fullName = "Full name must not exceed 100 characters.";
  }

  // email — backend: @NotBlank, @Email
  if (!email.trim()) {
    errors.email = "Professional email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  // password — backend: @NotBlank, @Size(min=8, max=20)
  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  } else if (password.length > 20) {
    errors.password = "Password must not exceed 20 characters.";
  }

  // confirmPassword — frontend-only check
  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  // phoneNumber — backend: @NotBlank, @Pattern(^[6-9]\d{9}$)
  if (!phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!isValidIndianPhone(phoneNumber)) {
    errors.phoneNumber = "Enter a valid 10-digit Indian mobile number (starts with 6–9).";
  }

  // role — backend: @NotNull
  if (!role) {
    errors.role = "Please select a role.";
  }

  return errors;
};
