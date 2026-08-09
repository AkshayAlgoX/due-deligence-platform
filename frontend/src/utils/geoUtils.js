/**
 * Geo utility helpers — client-side mirrors of the backend's Haversine
 * distance logic (see ComparablePropertyServiceImpl.java on the backend).
 * Used for things like sorting/filtering already-fetched comparables
 * without re-hitting the API, and for map bounds calculations.
 */

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two lat/lng points, in km. */
export function haversineKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/** Filters a list of {latitude, longitude} points to those within radiusKm of a center point. */
export function withinRadius(center, points, radiusKm) {
  if (!center?.latitude || !center?.longitude) return [];
  return points.filter((p) => {
    const d = haversineKm(center.latitude, center.longitude, p.latitude, p.longitude);
    return d != null && d <= radiusKm;
  });
}

/** Computes a bounding box [[minLat, minLng], [maxLat, maxLng]] for a set of points, for map auto-fit. */
export function getBounds(points) {
  const valid = points.filter((p) => p.latitude != null && p.longitude != null);
  if (valid.length === 0) return null;
  const lats = valid.map((p) => p.latitude);
  const lngs = valid.map((p) => p.longitude);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}

export const RADIUS_OPTIONS = [1, 3, 5, 10];
