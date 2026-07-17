/**
 * Indian currency formatter.
 * Formats numbers in ₹ with Lakhs (L) / Crores (Cr) suffix.
 *
 * Examples:
 *   formatINR(1500)         → "₹1,500"
 *   formatINR(150000)       → "₹1.50 L"
 *   formatINR(15000000)     → "₹1.50 Cr"
 *   formatINR(1500000000)   → "₹150.00 Cr"
 */
export const formatINR = (amount) => {
  if (amount == null || isNaN(amount)) return "₹0";

  const num = Number(amount);

  if (num >= 10000000) {
    // Crores (1 Cr = 10,000,000)
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    // Lakhs (1 L = 100,000)
    return `₹${(num / 100000).toFixed(2)} L`;
  } else {
    // Standard Indian format with commas (12,500 → "12,500")
    return `₹${num.toLocaleString("en-IN")}`;
  }
};

/**
 * Full INR format (no suffix) — for detail views.
 * Example: 15000000 → "₹1,50,00,000"
 */
export const formatINRFull = (amount) => {
  if (amount == null || isNaN(amount)) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};