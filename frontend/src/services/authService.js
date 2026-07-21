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
 * Backend now returns AuthResponse { token } and logs the user in immediately.
 *
 * @param {{ fullName, email, password, phoneNumber, role }} payload
 * @returns {Promise<{ token: string }>}
 */
export const registerUser = async ({
  fullName,
  email,
  password,
  phoneNumber,
  role,
}) => {
  const payload = {
    fullName,
    email,
    password,
    phoneNumber,
    role,
  };

  const response = await api.post(API_ROUTES.REGISTER, payload);
  const { token } = response.data;

  // Auto-login: save token immediately so user goes straight to dashboard
  if (token) {
    saveToken(token, true); // rememberMe = true by default on register
    saveUser({ email, fullName }, true);
  }

  return response.data; // { token }
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

// ── Password Reset Flow ──────────────────────────────────────────

/**
 * Request a password reset OTP for the given email.
 * @param {string} email
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const forgotPassword = async (email) => {
  const response = await api.post(API_ROUTES.FORGOT_PASSWORD, { email });
  if (response.data.success === false) {
    throw new Error(response.data.message || "Failed to send reset code.");
  }
  return response.data;
};

/**
 * Verify OTP code sent to email.
 * @param {{ email, otp }} payload
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const verifyResetOtp = async ({ email, otp }) => {
  const response = await api.post(API_ROUTES.VERIFY_OTP, { email, otp });
  if (response.data.success === false) {
    throw new Error(response.data.message || "Invalid or expired code.");
  }
  return response.data;
};

/**
 * Reset password using verified OTP.
 * @param {{ email, otp, newPassword }} payload
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const resetPassword = async ({ email, otp, newPassword }) => {
  const response = await api.post(API_ROUTES.RESET_PASSWORD, {
    email,
    otp,
    newPassword,
  });
  if (response.data.success === false) {
    throw new Error(response.data.message || "Failed to reset password.");
  }
  return response.data;
};

// ── Google Sign-In ──────────────────────────────────────────────

/**
 * Login (or auto-register) with a Google credential JWT.
 * @param {string} credential - Google ID token from GoogleLogin button
 */
// ── Google Sign-In (2-step) ─────────────────────────────────────────

/**
 * Step 1: Sign in with Google.
 * @returns {Promise<{status, token?, email, name, picture}>}
 *   - status="AUTHENTICATED" → existing user, token returned, ready to redirect
 *   - status="PROFILE_INCOMPLETE" → new user, must complete profile
 */
export const loginWithGoogle = async (credential) => {
  const response = await api.post(API_ROUTES.GOOGLE_LOGIN, { credential });
  const data = response.data;

  // If existing user → save token immediately
  if (data.status === "AUTHENTICATED" && data.token) {
    saveToken(data.token, true);
    saveUser({ email: data.email, fullName: data.name }, true);
  }

  return data;
};

/**
 * Step 2: Complete Google signup with role + phone.
 * @param {{ credential, role, phoneNumber }} payload
 */
export const completeGoogleSignup = async ({ credential, role, phoneNumber }) => {
  const response = await api.post(API_ROUTES.COMPLETE_GOOGLE_SIGNUP, {
    credential,
    role,
    phoneNumber,
  });

  const { token } = response.data;
  if (token) {
    saveToken(token, true);
  }

  return response.data;
};

/** Extract email claim from JWT payload (best-effort). */
function extractEmailFromJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.sub || decoded.email || null;
  } catch {
    return null;
  }
}
/**
 * Fetch the current user's fresh profile from the backend.
 * Prefer this over decoding JWT — data is always current.
 *
 * Backend: GET /api/auth/me
 * Response → UserProfileResponse {
 *   id, fullName, email, phoneNumber, role, authProvider, profilePicture, createdAt
 * }
 */
export async function getCurrentUser() {
  const { data } = await api.get("/api/auth/me");
  return data;
}
/**
 * Permanently delete the current user's account.
 * Requires password confirmation + typing "DELETE".
 */
export async function deleteAccount({ password, confirmation }) {
  const { data } = await api.delete("/api/auth/account", {
    data: { password, confirmation },
  });
  return data;
}

/**
 * Update the current user's profile.
 * Only fullName and phoneNumber can be edited.
 *
 * @param {{ fullName?: string, phoneNumber?: string }} payload
 * @returns Updated UserProfileResponse
 */
export async function updateProfile(payload) {
  const { data } = await api.put("/api/auth/me", payload);
  return data;
}

/**
 * Change password for authenticated user.
 * Requires current password + new password.
 * Not available for Google-only accounts.
 *
 * @param {{ currentPassword, newPassword }} payload
 */
export async function changePassword(payload) {
  const { data } = await api.post("/api/auth/change-password", payload);
  if (data.success === false) {
    throw new Error(data.message || "Failed to change password.");
  }
  return data;
}

