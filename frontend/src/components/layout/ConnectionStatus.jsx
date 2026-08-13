"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { subscribeToConnectionState } from "@/services/sseService";

export default function ConnectionStatus() {
  const [state, setState] = useState("connected");
  const [showRecovered, setShowRecovered] = useState(false);

  useEffect(() => {
    const unsub = subscribeToConnectionState((newState) => {
      setState((prev) => {
        // If we recovered from a bad state → connected, show a green flash
        if (
          (prev === "reconnecting" || prev === "disconnected") &&
          newState === "connected"
        ) {
          setShowRecovered(true);
          setTimeout(() => setShowRecovered(false), 2500);
        }
        return newState;
      });
    });
    return unsub;
  }, []);

  // Don't show anything when normally connected
  const shouldShow =
    state === "reconnecting" || state === "disconnected" || showRecovered;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-4 right-4 z-[60] pointer-events-none"
        >
          {showRecovered ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium backdrop-blur-md">
              <Wifi className="h-3 w-3" />
              Reconnected
            </div>
          ) : state === "reconnecting" ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium backdrop-blur-md">
              <Loader2 className="h-3 w-3 animate-spin" />
              Reconnecting…
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium backdrop-blur-md">
              <WifiOff className="h-3 w-3" />
              Offline
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}