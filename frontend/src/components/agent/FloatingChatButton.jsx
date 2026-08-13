"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import ChatPanel from "./ChatPanel";

export default function FloatingChatButton({ propertyId = null, propertyAddress = null }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ChatPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        propertyId={propertyId}
        propertyAddress={propertyAddress}
      />

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow"
        title="AI Property Assistant"
      >
        {/* Pulse ring */}
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Ask AI
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}