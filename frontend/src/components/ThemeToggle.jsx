"use client";

import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeContext as useTheme } from "@/app/providers";

/**
 * ThemeToggle — Sun/Moon button for the Navbar
 *
 * Design decisions:
 * - Sun icon shown in dark mode  (click → go light)
 * - Moon icon shown in light mode (click → go dark)
 * - Icons animate in/out with framer-motion (rotate + scale + fade)
 * - Button has a subtle bg that adapts to current theme
 * - Tooltip on hover ("Switch to dark mode" / "Switch to light mode")
 * - 40×40px hit area (matches the bell button size in Navbar)
 * - No text label — icon is universally understood
 */
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="
          relative
          flex items-center justify-center
          h-10 w-10
          rounded-xl
          text-gray-500
          transition-colors
          hover:bg-gray-100
          hover:text-gray-700
          dark:text-gray-400
          dark:hover:bg-gray-800
          dark:hover:text-gray-200
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#22C55E]
          focus-visible:ring-offset-2
        "
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            /* Sun — shown in dark mode, click to go light */
            <motion.span
              key="sun"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0,   scale: 1, opacity: 1 }}
              exit={{    rotate:  90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute"
            >
              <Sun size={20} strokeWidth={2} />
            </motion.span>
          ) : (
            /* Moon — shown in light mode, click to go dark */
            <motion.span
              key="moon"
              initial={{ rotate: 90,  scale: 0, opacity: 0 }}
              animate={{ rotate: 0,   scale: 1, opacity: 1 }}
              exit={{    rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute"
            >
              <Moon size={20} strokeWidth={2} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Tooltip — appears on hover, above the button */}
      <div
        className="
          pointer-events-none
          absolute
          bottom-full
          left-1/2
          -translate-x-1/2
          mb-2
          whitespace-nowrap
          rounded-lg
          bg-gray-900
          px-2.5
          py-1
          text-[11px]
          font-medium
          text-white
          opacity-0
          transition-opacity
          group-hover:opacity-100
          dark:bg-gray-700
          z-10
        "
      >
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
        {/* Tooltip arrow */}
        <span
          className="
            absolute
            top-full
            left-1/2
            -translate-x-1/2
            border-4
            border-transparent
            border-t-gray-900
            dark:border-t-gray-700
          "
        />
      </div>
    </div>
  );
}