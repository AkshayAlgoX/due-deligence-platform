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
 * ⚠️ i18n: Returns translation KEYS (not English strings).
 * The consuming component must render errors through t().
 * If a key is missing, i18next falls back to returning the key itself,
 * so backend error strings that happen to flow into this state also render safely.
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
    errors.fullName = "auth.register.errors.fullNameRequired";
  } else if (fullName.trim().length < 3) {
    errors.fullName = "auth.register.errors.fullNameShort";
  } else if (fullName.trim().length > 100) {
    errors.fullName = "auth.register.errors.fullNameLong";
  }

  // email — backend: @NotBlank, @Email
  if (!email.trim()) {
    errors.email = "auth.register.errors.emailRequired";
  } else if (!isValidEmail(email)) {
    errors.email = "auth.register.errors.emailInvalid";
  }

  // password — backend: @NotBlank, @Size(min=8, max=20)
  if (!password) {
    errors.password = "auth.errors.passwordRequired";
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = "auth.errors.passwordLength";
  } else if (password.length > 20) {
    errors.password = "auth.register.errors.passwordLong";
  }

  // confirmPassword — frontend-only check
  if (!confirmPassword) {
    errors.confirmPassword = "auth.register.errors.confirmRequired";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "auth.register.errors.passwordsMismatch";
  }

  // phoneNumber — backend: @NotBlank, @Pattern(^[6-9]\d{9}$)
  if (!phoneNumber.trim()) {
    errors.phoneNumber = "auth.register.errors.phoneRequired";
  } else if (!isValidIndianPhone(phoneNumber)) {
    errors.phoneNumber = "auth.register.errors.phoneInvalid";
  }

  // role — backend: @NotNull
  if (!role) {
    errors.role = "auth.register.errors.roleRequired";
  }

  return errors;
};