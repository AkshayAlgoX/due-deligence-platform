import { TOKEN_KEY, USER_KEY } from "@/constants/appConstants";

// ── Storage strategy ────────────────────────────────────────────────────────
// If persistent=true  → localStorage  (survives browser restart — "Remember Me")
// If persistent=false → sessionStorage (cleared when tab closes)
//
// On read, we check BOTH so callers don't need to know which one was used.

const getStorage = (persistent) =>
  persistent ? window.localStorage : window.sessionStorage;

// ── Token helpers ────────────────────────────────────────────────────────────

/** Persist the JWT token. Pass persistent=false for "Remember Me: off". */
export const saveToken = (token, persistent = true) => {
  if (typeof window === "undefined") return;
  // Clear from the "other" storage first to avoid duplicates
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  getStorage(persistent).setItem(TOKEN_KEY, token);
  // ── NEW: also write cookie so middleware.ts can read it ──
  const maxAge = persistent ? 60 * 60 * 24 * 7 : 0;
  document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
};

/** Retrieve the JWT token from whichever storage holds it. */
export const getToken = () => {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem(TOKEN_KEY) ||
    window.sessionStorage.getItem(TOKEN_KEY)
  );
};

/** Remove the JWT token from both storages (logout). */
export const removeToken = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
  // ── NEW: clear cookies too ──
  document.cookie = "auth_token=; path=/; max-age=0";
  document.cookie = "auth_user=; path=/; max-age=0";
};

// ── User helpers ─────────────────────────────────────────────────────────────

/** Persist the authenticated user object (uses same strategy as token). */
export const saveUser = (user, persistent = true) => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem(USER_KEY);
  getStorage(persistent).setItem(USER_KEY, JSON.stringify(user));
  // ── NEW: also write cookie so middleware.ts can read it ──
  const maxAge = persistent ? 60 * 60 * 24 * 7 : 0;
  document.cookie = `auth_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${maxAge}; SameSite=Strict`;
};

/** Retrieve the authenticated user object. */
export const getUser = () => {
  if (typeof window === "undefined") return null;
  const raw =
    window.localStorage.getItem(USER_KEY) ||
    window.sessionStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

/** Quick boolean: is the user logged in? */
export const isAuthenticated = () => !!getToken();

// ── Password strength ────────────────────────────────────────────────────────

/**
 * Returns a password strength descriptor.
 * @param {string} password
 * @returns {{ label: string, color: string, width: string }}
 */
export const getPasswordStrength = (password) => {
  if (!password) return { label: "", color: "bg-gray-200", width: "w-0" };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
  if (score === 2) return { label: "Fair", color: "bg-yellow-400", width: "w-2/4" };
  if (score === 3) return { label: "Good", color: "bg-blue-500", width: "w-3/4" };
  return { label: "Strong", color: "bg-green-500", width: "w-full" };
};