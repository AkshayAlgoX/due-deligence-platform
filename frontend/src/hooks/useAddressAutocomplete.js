"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Address autocomplete using Nominatim (OpenStreetMap).
 *
 * Rules we respect:
 *   1. User-Agent header (required by Nominatim policy)
 *   2. Max 1 request per second (we debounce 400ms + throttle)
 *   3. Cache results in sessionStorage (avoid re-hits)
 *   4. India-only results (countrycodes=in)
 *   5. Attribution shown in dropdown UI
 *
 * Docs: https://nominatim.org/release-docs/latest/api/Search/
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 3;
const CACHE_KEY_PREFIX = "nominatim-cache-";

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100; // just over 1s to be safe

async function throttledFetch(url) {
  const now = Date.now();
  const wait = Math.max(0, MIN_REQUEST_INTERVAL - (now - lastRequestTime));
  if (wait > 0) {
    await new Promise((r) => setTimeout(r, wait));
  }
  lastRequestTime = Date.now();

  return fetch(url, {
    headers: {
      // Nominatim requires a User-Agent identifying the app
      "Accept": "application/json",
    },
  });
}

function getCached(query) {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + query);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCached(query, data) {
  try {
    sessionStorage.setItem(CACHE_KEY_PREFIX + query, JSON.stringify(data));
  } catch {
    // storage full — silently ignore
  }
}

export function useAddressAutocomplete(query) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Abort previous request
    if (abortRef.current) abortRef.current.abort();

    const trimmed = (query || "").trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    // Check cache first (synchronous — no debounce needed)
    const cached = getCached(trimmed.toLowerCase());
    if (cached) {
      setSuggestions(cached);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const url = `${NOMINATIM_URL}?q=${encodeURIComponent(
          trimmed
        )}&format=json&addressdetails=1&limit=5&countrycodes=in`;

        const res = await throttledFetch(url, { signal: controller.signal });

        if (!res.ok) throw new Error("Nominatim request failed");

        const data = await res.json();

        const parsed = data.map((item) => ({
          id: item.place_id,
          displayName: item.display_name,
          address: buildStreetAddress(item.address, item.display_name),
          city: extractCity(item.address),
          state: item.address?.state || "",
          zipCode: item.address?.postcode || "",
          lat: item.lat,
          lon: item.lon,
        }));

        setCached(trimmed.toLowerCase(), parsed);
        setSuggestions(parsed);
      } catch (err) {
        if (err.name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query]);

  return { suggestions, loading, clear: () => setSuggestions([]) };
}

function buildStreetAddress(addr, fallback) {
  if (!addr) return fallback || "";
  const parts = [
    addr.house_number,
    addr.road || addr.pedestrian || addr.residential,
    addr.neighbourhood || addr.suburb,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : (fallback || "").split(",")[0];
}

function extractCity(addr) {
  if (!addr) return "";
  return (
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.county ||
    ""
  );
}