import {
  Sparkles,
  Flame,
  TrendingDown,
  Star,
  CircleCheck,
  Clock,
  Crown,
} from "lucide-react";

/**
 * Label configurations - Zillow/Redfin grade
 * Each label has: color, icon, animation, priority (for sorting)
 */
export const LABEL_CONFIG = {
  NEW: {
    key: "NEW",
    icon: Sparkles,
    priority: 1,
    // Green
    bg: "bg-green-500",
    bgDark: "dark:bg-green-500",
    text: "text-white",
    ring: "ring-green-400/50",
    glow: "shadow-green-500/30",
    animate: false,
  },
  HOT: {
    key: "HOT",
    icon: Flame,
    priority: 2,
    // Red
    bg: "bg-red-500",
    bgDark: "dark:bg-red-500",
    text: "text-white",
    ring: "ring-red-400/50",
    glow: "shadow-red-500/40",
    animate: true, // pulse animation
  },
  PRICE_DROP: {
    key: "PRICE_DROP",
    icon: TrendingDown,
    priority: 3,
    // Orange
    bg: "bg-orange-500",
    bgDark: "dark:bg-orange-500",
    text: "text-white",
    ring: "ring-orange-400/50",
    glow: "shadow-orange-500/30",
    animate: false,
  },
  FEATURED: {
    key: "FEATURED",
    icon: Star,
    priority: 4,
    // Blue
    bg: "bg-blue-500",
    bgDark: "dark:bg-blue-500",
    text: "text-white",
    ring: "ring-blue-400/50",
    glow: "shadow-blue-500/30",
    animate: false,
  },
  UNDER_OFFER: {
    key: "UNDER_OFFER",
    icon: Clock,
    priority: 6,
    // Yellow
    bg: "bg-yellow-500",
    bgDark: "dark:bg-yellow-500",
    text: "text-gray-900",
    ring: "ring-yellow-400/50",
    glow: "shadow-yellow-500/30",
    animate: false,
  },
  SOLD: {
    key: "SOLD",
    icon: CircleCheck,
    priority: 7,
    // Gray
    bg: "bg-gray-600",
    bgDark: "dark:bg-gray-700",
    text: "text-white",
    ring: "ring-gray-400/50",
    glow: "shadow-gray-500/30",
    animate: false,
  },
  PREMIUM: {
    key: "PREMIUM",
    icon: Crown,
    priority: 0, // Highest priority — always first
    // Gold gradient
    bg: "bg-gradient-to-r from-amber-500 to-yellow-500",
    bgDark: "dark:from-amber-500 dark:to-yellow-500",
    text: "text-white",
    ring: "ring-amber-400/60",
    glow: "shadow-amber-500/40",
    animate: false,
  },
};

export const LABEL_TYPES = Object.keys(LABEL_CONFIG);

export const AUTO_LABELS = ["NEW", "HOT", "PRICE_DROP", "SOLD"];
export const MANUAL_LABELS = ["FEATURED", "UNDER_OFFER", "PREMIUM"];

export const MAX_VISIBLE_LABELS = 2; // Show max 2, then "+N more"