/**
 * CPCB (Central Pollution Control Board, India) AQI color scale.
 * Same thresholds used by the backend categorizer.
 *
 * Reference: https://cpcb.nic.in/national-air-quality-index/
 */

export const AQI_SCALE = [
  { max: 50,  category: "GOOD",         label: "Good",         color: "text-green-700  bg-green-50  ring-green-200",  desc: "Minimal impact" },
  { max: 100, category: "SATISFACTORY", label: "Satisfactory", color: "text-lime-700   bg-lime-50   ring-lime-200",   desc: "Minor breathing discomfort to sensitive people" },
  { max: 200, category: "MODERATE",     label: "Moderate",     color: "text-yellow-700 bg-yellow-50 ring-yellow-200", desc: "Breathing discomfort to sensitive groups" },
  { max: 300, category: "POOR",         label: "Poor",         color: "text-orange-700 bg-orange-50 ring-orange-200", desc: "Breathing discomfort on prolonged exposure" },
  { max: 400, category: "VERY_POOR",    label: "Very poor",    color: "text-red-700    bg-red-50    ring-red-200",    desc: "Respiratory illness on prolonged exposure" },
  { max: Infinity, category: "SEVERE",  label: "Severe",       color: "text-rose-800   bg-rose-100  ring-rose-300",   desc: "Serious health impact on everyone" },
];

export function getAqiInfo(aqi) {
  if (aqi == null) {
    return { category: "UNKNOWN", label: "Unknown", color: "text-gray-600 bg-gray-50 ring-gray-200", desc: "No data" };
  }
  return AQI_SCALE.find((tier) => aqi <= tier.max) ?? AQI_SCALE[AQI_SCALE.length - 1];
}