"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

/**
 * CountUp — smoothly animates from 0 to target value on mount.
 * Perfect for stat cards, KPIs, dashboards.
 *
 * @param {number} value — final value
 * @param {number} duration — seconds
 * @param {string} prefix — e.g. "$", "₹"
 * @param {string} suffix — e.g. "%", "K"
 * @param {number} decimals
 */
export default function CountUp({
  value = 0,
  duration = 1.2,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) =>
    decimals === 0
      ? Math.round(v).toLocaleString()
      : v.toFixed(decimals)
  );

  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(count, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // premium easing
      onUpdate: (v) => {
        setDisplay(
          decimals === 0
            ? Math.round(v).toLocaleString()
            : v.toFixed(decimals)
        );
      },
    });
    return controls.stop;
  }, [value, duration, decimals, count]);

  return (
    <motion.span className={className}>
      {prefix}
      {display}
      {suffix}
    </motion.span>
  );
}