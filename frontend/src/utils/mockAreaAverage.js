/**
 * mockAreaAverage.js
 *
 * Client-side deterministic pseudo-values for "area average" comparison.
 * Same propertyId → same values every render (stable, no flicker).
 *
 * When backend endpoint for real area avg lands, swap this file's
 * implementation without touching any UI.
 */

// Simple deterministic hash → [0, 1)
function seededRandom(seed, salt = 0) {
  const s = (Number(seed) || 1) * 9301 + salt * 49297 + 233280;
  return ((s % 233280) / 233280 + 1) % 1;
}

/**
 * Generate stable area average scores for a property.
 * Values sit in [15, 55] to feel like "typical Bangalore avg".
 *
 * @param {string|number} propertyId
 * @returns {{
 *   floodScore: number,
 *   legalScore: number,
 *   taxScore: number,
 *   zoningScore: number,
 *   environmentalScore: number,
 *   marketScore: number,
 *   overallScore: number,
 * }}
 */
export function getAreaAverage(propertyId) {
  const id = propertyId || 1;
  const floodScore = 15 + seededRandom(id, 1) * 40;
  const legalScore = 15 + seededRandom(id, 2) * 40;
  const taxScore = 15 + seededRandom(id, 3) * 40;
  const zoningScore = 15 + seededRandom(id, 4) * 40;
  const environmentalScore = 15 + seededRandom(id, 5) * 40;
  const marketScore = 15 + seededRandom(id, 6) * 40;
  const overallScore =
    (floodScore * 0.25 +
      legalScore * 0.2 +
      taxScore * 0.15 +
      zoningScore * 0.15 +
      environmentalScore * 0.15 +
      marketScore * 0.1);

  return {
    floodScore,
    legalScore,
    taxScore,
    zoningScore,
    environmentalScore,
    marketScore,
    overallScore,
  };
}