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
 * Step 1 of registration: send a 6-digit OTP to the user's email.
 * Does NOT create the account yet.
 *
 * @param {{ fullName, email, password, phoneNumber, role }} payload
 * @returns {Promise<{ success, message, maskedEmail, resendCooldownSeconds, expiresInSeconds }>}
 */
export const sendRegistrationOtp = async ({
  fullName,
  email,
  password,
  phoneNumber,
  role,
}) => {
  const response = await api.post(API_ROUTES.REGISTER_SEND_OTP, {
    fullName,
    email,
    password,
    phoneNumber,
    role,
  });
  return response.data;
};

/**
 * Step 2 of registration: verify OTP, create real account, auto-login.
 *
 * @param {{ email, otp, fullName, role }} payload
 *   fullName + role are only used locally to populate saveUser cache
 *   (backend uses whatever was stored in PendingRegistration)
 * @returns {Promise<{ token: string }>}
 */
export const verifyRegistrationOtp = async ({ email, otp, fullName, role }) => {
  const response = await api.post(API_ROUTES.REGISTER_VERIFY_OTP, {
    email,
    otp,
  });
  const { token } = response.data;

  if (token) {
    saveToken(token, true);
    try {
      const profile = await getCurrentUser();
      saveUser(
        {
          email,
          fullName: profile.fullName || fullName,
          role: profile.role || role,
          profilePicture: profile.profilePicture || null,
        },
        true
      );
    } catch {
      saveUser({ email, fullName, role, profilePicture: null }, true);
    }
  }

  return response.data;
};

/**
 * Step 3 (optional): request a fresh OTP for an existing pending registration.
 * Rate-limited server-side (60s cooldown, 3 per hour).
 *
 * @param {string} email
 * @returns {Promise<{ success, message, maskedEmail, resendCooldownSeconds, expiresInSeconds }>}
 */
export const resendRegistrationOtp = async (email) => {
  const response = await api.post(API_ROUTES.REGISTER_RESEND_OTP, { email });
  return response.data;
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

  // Fetch fresh profile to get role (needed by middleware for RBAC)
  const profile = await getCurrentUser();
  saveUser(
  {
    email,
    fullName: profile.fullName,
    role: profile.role,
    profilePicture: profile.profilePicture || null,
  },
  rememberMe
);
}

return response.data;
};

/** Logout — clear local session only (stateless JWT). */
export const logoutUser = () => {
  removeToken();
};

/**
 * Sign out from all devices — server-side session invalidation.
 * Sets the user's tokenValidFrom timestamp on the backend, causing
 * ALL existing JWTs (including this one) to be rejected on next request.
 *
 * Caller is responsible for clearing local storage and redirecting.
 *
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const logoutAllDevices = async () => {
  const response = await api.post(API_ROUTES.LOGOUT_ALL_DEVICES);
  if (response.data.success === false) {
    throw new Error(response.data.message || "Failed to sign out everywhere.");
  }
  return response.data;
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

  // Fetch fresh profile to get role (needed by middleware for RBAC)
  const profile = await getCurrentUser();
  saveUser(
  {
    email: data.email,
    fullName: data.name,
    role: profile.role,
    profilePicture: profile.profilePicture || null,
  },
  true
);
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

  // Fetch fresh profile to get role (needed by middleware for RBAC)
  const profile = await getCurrentUser();
  saveUser(
  {
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role,
    profilePicture: profile.profilePicture || null,
  },
  true
);
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

