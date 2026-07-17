/**
 * Authentication service.
 *
 * POST /api/auth/register
 *   Request  → RegisterRequest { fullName, email, password, phoneNumber, role }
 *              ↑ field names must match Java DTO exactly (camelCase)
 *   Response → ApiResponse     { success: boolean, message: string }
 *
 *   Backend RoleType enum values:
 *     BUYER | REAL_ESTATE_AGENT | LEGAL_REVIEWER | FINANCIAL_INSTITUTION | ADMIN
 *
 * POST /api/auth/login
 *   Request  → LoginRequest  { email, password }
 *   Response → AuthResponse  { token: string }
 *
 * Storage strategy:
 *   rememberMe = true  → localStorage   (persists across browser restarts)
 *   rememberMe = false → sessionStorage (cleared when the tab closes)
 */
import api from "./api";
import { API_ROUTES } from "@/constants/apiRoutes";
import { saveToken, saveUser, removeToken } from "@/utils/helpers";

/**
 * Register a new user.
 * @param {{ fullName, email, password, phoneNumber, role }} payload
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const registerUser = async ({
  fullName,
  email,
  password,
  phoneNumber,
  role,
}) => {
  // Exact payload the backend's RegisterRequest.java expects
  const payload = {
    fullName,       // @NotBlank @Size(min=3, max=100)
    email,          // @NotBlank @Email
    password,       // @NotBlank @Size(min=8, max=20)
    phoneNumber,    // @NotBlank @Pattern(^[6-9]\d{9}$)
    role,           // @NotNull  RoleType enum string
  };

  const response = await api.post(API_ROUTES.REGISTER, payload);

  // Backend returns HTTP 200 even when email already exists:
  //   { success: false, message: "Email already exists" }
  if (response.data.success === false) {
    throw new Error(response.data.message || "Registration failed.");
  }

  return response.data; // { success: true, message: "User registered successfully" }
};

/**
 * Login an existing user.
 * @param {{ email, password, rememberMe? }} payload
 * @returns {Promise<{ token: string }>}
 */
export const loginUser = async ({ email, password, rememberMe = true }) => {
  const response = await api.post(API_ROUTES.LOGIN, { email, password });

  const { token } = response.data;

  if (token) {
    // Persist token + user with the chosen storage strategy
    saveToken(token, rememberMe);
    saveUser({ email }, rememberMe);
  }

  return response.data;
};

/** Logout — clear local session only (stateless JWT). */
export const logoutUser = () => {
  removeToken();
};