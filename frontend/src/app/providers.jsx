"use client";

import { createContext, useContext } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import I18nProvider from "@/components/I18nProvider";
import { useTheme } from "@/hooks/useTheme";

/* ─────────────────────────────────────────────────────────────────────────────
   Theme Context
   Provides isDark, theme, resolvedTheme, setTheme, toggleTheme
   to any component in the tree via useThemeContext().
───────────────────────────────────────────────────────────────────────────── */
const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

/**
 * useThemeContext — use this in any component that needs theme state.
 *
 * Prefer this over useTheme() directly so the whole app shares
 * one theme instance (no duplicate localStorage reads).
 *
 * Usage:
 *   const { isDark, toggleTheme } = useThemeContext();
 */
export function useThemeContext() {
  return useContext(ThemeContext);
}

/**
 * ThemeProvider — internal, used only inside Providers below.
 * Runs useTheme() once and broadcasts result via context.
 */
function ThemeProvider({ children }) {
  const themeValue = useTheme();
  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Providers — root client wrapper
   Order (outer → inner):
     ThemeProvider       ← theme context available everywhere
       I18nProvider      ← teammate's i18n (untouched)
         GoogleOAuth     ← teammate's Google auth (untouched)
           {children}
───────────────────────────────────────────────────────────────────────────── */
export default function Providers({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const content = googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  ) : (
    children
  );

  return (
    <ThemeProvider>
      <I18nProvider>{content}</I18nProvider>
    </ThemeProvider>
  );
}