"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * useTheme — Production-grade theme management hook
 *
 * Supports 3 values:
 *   "light"  → always light
 *   "dark"   → always dark
 *   "system" → follows OS preference (default for first-time visitors)
 *
 * Flow:
 *   1. On mount, read localStorage("theme")
 *   2. If no stored value → use "system" (respects prefers-color-scheme)
 *   3. Apply "dark" class to <html> based on resolved value
 *   4. On toggle → save to localStorage → apply class → re-render
 *
 * The no-flash inline script in layout.js handles the FIRST paint.
 * This hook handles everything AFTER React hydrates.
 */

const STORAGE_KEY = "theme";

/** Reads OS dark preference. Safe to call on client only. */
function getSystemPreference() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/** Resolves "system" → "light" | "dark" */
function resolveTheme(value) {
  if (value === "system") return getSystemPreference();
  if (value === "dark") return "dark";
  return "light";
}

/** Applies or removes the "dark" class on <html> */
function applyTheme(resolved) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function useTheme() {
  // Initialize from localStorage synchronously where possible
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return "system";
    return localStorage.getItem(STORAGE_KEY) || "system";
  });

  // Resolved = what's actually showing ("light" or "dark", never "system")
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem(STORAGE_KEY) || "system";
    return resolveTheme(stored);
  });

  // On mount: sync state with what the no-flash script already applied
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) || "system";
    const resolved = resolveTheme(stored);
    setThemeState(stored);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Listen for OS preference changes (only matters when theme === "system")
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      // Only react to OS change if user hasn't picked a manual preference
      const stored = localStorage.getItem(STORAGE_KEY) || "system";
      if (stored === "system") {
        const resolved = getSystemPreference();
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  /**
   * setTheme("light" | "dark" | "system")
   * Call this from ThemeToggle or anywhere else.
   */
  const setTheme = useCallback((newTheme) => {
    const resolved = resolveTheme(newTheme);

    // Suppress the 200ms transition during the instant toggle flip
    // (we want the toggle itself to feel instant, not a slow fade)
    document.documentElement.classList.add("no-transition");

    setThemeState(newTheme);
    setResolvedTheme(resolved);
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(resolved);

    // Re-enable transitions after one frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove("no-transition");
      });
    });
  }, []);

  /** Convenience toggle: dark ↔ light (skips "system" in toggle cycle) */
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return {
    theme,           // stored value: "light" | "dark" | "system"
    resolvedTheme,   // actual value: "light" | "dark"
    setTheme,        // set specific theme
    toggleTheme,     // toggle dark ↔ light
    isDark: resolvedTheme === "dark",
  };
}