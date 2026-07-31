/**
 * CPCB (Central Pollution Control Board, India) AQI color scale.
 * Same thresholds used by the backend categorizer.
 *
 * Reference: https://cpcb.nic.in/national-air-quality-index/
 *
 * label and desc are now i18n keys — call t(labelKey) and t(descriptionKey)
 * in components instead of using the raw English strings.
 */

export const AQI_SCALE = [
  {
    max: 50,
    category: "GOOD",
    labelKey: "aqiScale.labels.good",
    descriptionKey: "aqiScale.descriptions.good",
    hex: "#15803d",
    color: "text-green-700  bg-green-50  ring-green-200",
  },
  {
    max: 100,
    category: "SATISFACTORY",
    labelKey: "aqiScale.labels.satisfactory",
    descriptionKey: "aqiScale.descriptions.satisfactory",
    hex: "#4d7c0f",
    color: "text-lime-700   bg-lime-50   ring-lime-200",
  },
  {
    max: 200,
    category: "MODERATE",
    labelKey: "aqiScale.labels.moderate",
    descriptionKey: "aqiScale.descriptions.moderate",
    hex: "#a16207",
    color: "text-yellow-700 bg-yellow-50 ring-yellow-200",
  },
  {
    max: 300,
    category: "POOR",
    labelKey: "aqiScale.labels.poor",
    descriptionKey: "aqiScale.descriptions.poor",
    hex: "#c2410c",
    color: "text-orange-700 bg-orange-50 ring-orange-200",
  },
  {
    max: 400,
    category: "VERY_POOR",
    labelKey: "aqiScale.labels.veryPoor",
    descriptionKey: "aqiScale.descriptions.veryPoor",
    hex: "#b91c1c",
    color: "text-red-700    bg-red-50    ring-red-200",
  },
  {
    max: Infinity,
    category: "SEVERE",
    labelKey: "aqiScale.labels.severe",
    descriptionKey: "aqiScale.descriptions.severe",
    hex: "#9f1239",
    color: "text-rose-800   bg-rose-100  ring-rose-300",
  },
];

export function getAqiInfo(aqi) {
  if (aqi == null) {
    return {
      category: "UNKNOWN",
      labelKey: null,
      descriptionKey: null,
      hex: "#6b7280",
      color: "text-gray-600 bg-gray-50 ring-gray-200",
    };
  }
  return AQI_SCALE.find((tier) => aqi <= tier.max) ?? AQI_SCALE[AQI_SCALE.length - 1];
}