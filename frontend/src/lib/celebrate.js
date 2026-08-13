"use client";

import confetti from "canvas-confetti";

/**
 * Fire a premium confetti celebration.
 * Emerald + teal color scheme matching brand.
 *
 * @param {"report-complete"|"upgrade"|"generic"} type
 */
export function celebrate(type = "generic") {
  const colors =
    type === "upgrade"
      ? ["#8b5cf6", "#a78bfa", "#c4b5fd", "#22C55E", "#16a34a"] // violet + green (premium tier)
      : ["#22C55E", "#16a34a", "#14b8a6", "#0ea5e9", "#ffffff"]; // emerald + teal (default)

  const duration = type === "upgrade" ? 4000 : 2500;
  const end = Date.now() + duration;

  // Left cannon
  const shootLeft = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      scalar: 1.1,
      ticks: 200,
    });
  };

  // Right cannon
  const shootRight = () => {
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      scalar: 1.1,
      ticks: 200,
    });
  };

  // Big center burst
  confetti({
    particleCount: 100,
    spread: 90,
    origin: { y: 0.6 },
    colors,
    scalar: 1.2,
    ticks: 200,
  });

  // Continuous cannons
  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }
    shootLeft();
    shootRight();
  }, 200);
}

/**
 * Fire confetti ONCE per event (uses localStorage key).
 * Perfect for "first-time only" celebrations.
 */
export function celebrateOnce(key, type = "generic") {
  if (typeof window === "undefined") return;
  const storageKey = `celebrated:${key}`;
  if (localStorage.getItem(storageKey)) return;
  localStorage.setItem(storageKey, String(Date.now()));
  celebrate(type);
}