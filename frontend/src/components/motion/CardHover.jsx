"use client";

import { motion } from "framer-motion";

/**
 * CardHover — wraps any card with premium hover interaction.
 * Use on stat cards, dashboard tiles, list items.
 */
export default function CardHover({ children, className = "", onClick, ...rest }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.12)" }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      onClick={onClick}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}