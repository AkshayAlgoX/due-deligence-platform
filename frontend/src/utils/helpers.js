import { TOKEN_KEY, USER_KEY } from "@/constants/appConstants";

// ── Token helpers ────────────────────────────────────────────────────────────

/** Persist the JWT token in localStorage. */
export const saveToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/** Retrieve the JWT token from localStorage. */
export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

/** Remove the JWT token (logout). */
export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

// ── User helpers ─────────────────────────────────────────────────────────────

/** Persist the authenticated user object. */
export const saveUser = (user) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/** Retrieve the authenticated user object. */
export const getUser = () => {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  return null;
};

// ── Password strength ────────────────────────────────────────────────────────

/**
 * Returns a password strength descriptor.
 * @param {string} password
 * @returns {{ label: string, color: string, width: string }}
 */
export const getPasswordStrength = (password) => {
  if (!password) return { label: "", color: "bg-gray-200", width: "w-0" };

  let score = 0;
  if (password.length >= 8)  score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak",   color: "bg-red-500",    width: "w-1/4" };
  if (score === 2) return { label: "Fair",   color: "bg-yellow-400", width: "w-2/4" };
  if (score === 3) return { label: "Good",   color: "bg-blue-500",   width: "w-3/4" };
  return              { label: "Strong", color: "bg-green-500",  width: "w-full" };
};
