"use client";

/**
 * PriceHeatmap — renders price-intensity circles on the Leaflet map.
 *
 * NOTE: This does NOT use the `leaflet.heat` plugin, since I couldn't
 * confirm it's an installed dependency in this project (PortfolioMap.jsx
 * only imports `leaflet` + `react-leaflet`, no heat plugin). Instead this
 * renders semi-transparent color-graded CircleMarkers (green = cheaper
 * per sqft, red = pricier per sqft) as a lightweight heatmap-style effect
 * using only what's already installed. If `leaflet.heat` is available,
 * swap this out for a true heat layer for a smoother gradient.
 *
 * Must be rendered as a child of react-leaflet's <MapContainer>, and the
 * CircleMarker/Circle components must be passed in (same dynamic-import
 * pattern as PortfolioMap.jsx / ComparableMap.jsx) since react-leaflet
 * can't be imported at module scope (SSR).
 */
export default function PriceHeatmap({ CircleComponent, comparables }) {
  if (!CircleComponent || !comparables?.length) return null;

  const prices = comparables
    .map((c) => c.pricePerSqft)
    .filter((v) => v != null);
  if (prices.length === 0) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const heatColor = (value) => {
    if (value == null) return "#9ca3af";
    const t = (value - min) / range; // 0 = cheapest, 1 = priciest
    // green (#22C55E) → amber (#f59e0b) → red (#ef4444)
    if (t < 0.5) return interpolateColor("#22C55E", "#f59e0b", t / 0.5);
    return interpolateColor("#f59e0b", "#ef4444", (t - 0.5) / 0.5);
  };

  return (
    <>
      {comparables
        .filter((c) => c.latitude != null && c.longitude != null)
        .map((c) => (
          <CircleComponent
            key={`heat-${c.id}`}
            center={[c.latitude, c.longitude]}
            radius={250}
            pathOptions={{
              fillColor: heatColor(c.pricePerSqft),
              fillOpacity: 0.25,
              stroke: false,
            }}
          />
        ))}
    </>
  );
}

function interpolateColor(hex1, hex2, t) {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}
