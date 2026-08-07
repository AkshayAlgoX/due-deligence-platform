import { LABEL_CONFIG } from "@/constants/labels";

/**
 * Sort labels by priority (lower priority = higher importance)
 * PREMIUM (0) → NEW (1) → HOT (2) → PRICE_DROP (3) → ...
 */
export function sortLabelsByPriority(labels = []) {
  return [...labels].sort((a, b) => {
    const aConfig = LABEL_CONFIG[a.type] || { priority: 99 };
    const bConfig = LABEL_CONFIG[b.type] || { priority: 99 };
    return aConfig.priority - bConfig.priority;
  });
}

/**
 * Get label config by type. Returns null if unknown type.
 */
export function getLabelConfig(type) {
  return LABEL_CONFIG[type] || null;
}

/**
 * Check if label is expired (client-side safety check)
 */
export function isLabelExpired(label) {
  if (!label?.expiresAt) return false;
  return new Date(label.expiresAt) < new Date();
}

/**
 * Filter out expired labels
 */
export function filterActiveLabels(labels = []) {
  return labels.filter((l) => !isLabelExpired(l));
}