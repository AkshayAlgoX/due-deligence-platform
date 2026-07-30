// frontend/src/utils/enumTranslations.js

/**
 * Translates a backend enum value to its localized display label.
 * Normalizes the key to UPPERCASE first (handles "Commercial", "commercial", "COMMERCIAL").
 * Falls back to the raw enum if no translation key exists.
 */
export function translateEnum(t, namespace, value) {
  if (!value) return value;
  // Normalize: "Commercial" or "commercial" → "COMMERCIAL"
  const normalized = String(value).toUpperCase().replace(/\s+/g, "_");
  const key = `${namespace}.${normalized}`;
  const translated = t(key);
  return translated === key ? value : translated;
}

/**
 * Shorthand for property type enum translation.
 */
export function translatePropertyType(t, propertyType) {
  return translateEnum(t, "property.propertyTypes", propertyType);
}