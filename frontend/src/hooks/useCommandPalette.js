"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * useCommandPalette — global state + keyboard shortcut for the ⌘K palette.
 *
 * Registers Ctrl+K (Windows/Linux) and Cmd+K (Mac) to toggle the palette
 * anywhere in the app. Also handles Escape to close.
 *
 * Usage:
 *   const { open, setOpen, toggle } = useCommandPalette();
 *   <button onClick={() => setOpen(true)}>Search</button>
 *   <CommandPalette open={open} onClose={() => setOpen(false)} />
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K on Mac, Ctrl+K everywhere else
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";

      if (isCmdK) {
        e.preventDefault();
        toggle();
      }

      // Also support Escape to close (only when open)
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle, open]);

  return { open, setOpen, toggle, close };
}

/**
 * Recent searches persistence — stored in localStorage.
 * Keeps last 5 unique searches, most recent first.
 */
const RECENT_KEY = "command-palette-recent";
const MAX_RECENT = 5;

export function getRecentSearches() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query) {
  if (typeof window === "undefined" || !query?.trim()) return;
  try {
    const current = getRecentSearches();
    // Remove duplicate if exists, then prepend
    const filtered = current.filter(
      (q) => q.toLowerCase() !== query.toLowerCase()
    );
    const updated = [query, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // silently fail
  }
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    // silently fail
  }
}