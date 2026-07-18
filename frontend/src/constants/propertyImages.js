/**
 * Property image utilities.
 *
 * Strategy (like Notion, Slack, LinkedIn):
 * - If backend has real imageUrl → use it
 * - If no image → show elegant SVG placeholder (not fake stock photos)
 *
 * This is honest UX — user knows there's no image, not fake data.
 */

/**
 * Get property image URL or null if no real image exists.
 * Returns null when we should show a placeholder instead.
 */
export const getPropertyImage = (property) => {
  if (!property) return null;

  // Only return actual image URLs from backend
  if (property.imageUrl && property.imageUrl.startsWith("http")) {
    return property.imageUrl;
  }

  return null; // No real image → component will show placeholder
};

/**
 * Larger version for hero cards.
 */
export const getPropertyHeroImage = (property) => {
  return getPropertyImage(property);
};

/**
 * Get an elegant gradient background for placeholders based on property type.
 * Different types get different subtle gradients.
 */
export const getPlaceholderGradient = (propertyType) => {
  const gradients = {
    Residential: "from-blue-100 via-blue-50 to-white",
    Commercial: "from-purple-100 via-purple-50 to-white",
    Industrial: "from-orange-100 via-orange-50 to-white",
    Land: "from-green-100 via-green-50 to-white",
    "Mixed-Use": "from-pink-100 via-pink-50 to-white",
  };
  return gradients[propertyType] || gradients.Residential;
};

/**
 * Get an icon color for placeholder based on property type.
 */
export const getPlaceholderIconColor = (propertyType) => {
  const colors = {
    Residential: "text-blue-400",
    Commercial: "text-purple-400",
    Industrial: "text-orange-400",
    Land: "text-green-400",
    "Mixed-Use": "text-pink-400",
  };
  return colors[propertyType] || colors.Residential;
};