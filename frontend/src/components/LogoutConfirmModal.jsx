"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, X, ShieldCheck } from "lucide-react";
import { getUser } from "@/utils/helpers";

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  const modalRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUser(getUser());
      setLoggingOut(false);
      setTimeout(() => cancelBtnRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape" && !loggingOut) onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, loggingOut]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target) && !loggingOut) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    setLoggingOut(true);
    setTimeout(() => { onConfirm(); }, 1500);
  };

  if (!isOpen) return null;

  const email = user?.email || "";
  const fullName = user?.fullName || email.split("@")[0] || "User";
  const initials = (fullName || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-[#161b22] shadow-[0_25px_80px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.6)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ring-1 ring-black/5 dark:ring-[#30363d]"
      >
        {/* ── Close button ── */}
        <button
          type="button"
          onClick={onClose}
          disabled={loggingOut}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 dark:bg-[#1c2128] p-1.5 text-gray-500 dark:text-[#7d8590] shadow-sm ring-1 ring-black/5 dark:ring-[#30363d] backdrop-blur-sm transition hover:bg-white dark:hover:bg-[#30363d] hover:text-gray-700 dark:hover:text-[#e6edf3] disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── Red hero section ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-red-50 dark:from-[#2d1214] dark:via-[#3a0a0a] dark:to-[#2d1214] px-6 pt-10 pb-8">
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(239,68,68,0.08) 1px, transparent 1px)`,
              backgroundSize: "18px 18px",
            }}
          />

          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <span className="absolute h-full w-full animate-ping rounded-3xl bg-red-400/30" />
            <span className="absolute h-full w-full rounded-3xl bg-gradient-to-br from-red-100 dark:from-red-900/40 to-rose-200 dark:to-rose-900/40" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/40 ring-4 ring-white dark:ring-[#161b22]">
              <LogOut className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h2
            id="logout-title"
            className="mt-5 text-center text-[22px] font-black tracking-tight text-gray-900 dark:text-[#e6edf3]"
          >
            Ready to sign out?
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-center text-[13px] leading-relaxed text-gray-600 dark:text-[#7d8590]">
            You&apos;ll need to log in again to access your dashboard and property data.
          </p>
        </div>

        {/* ── User info card ── */}
        {user && (
          <div className="border-y border-gray-100 dark:border-[#30363d] bg-gradient-to-b from-white dark:from-[#161b22] to-gray-50/50 dark:to-[#1c2128]/50 px-6 py-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-[#0d1117] p-3 ring-1 ring-gray-100 dark:ring-[#30363d]">
              <div className="relative flex-shrink-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] text-sm font-black text-white shadow-lg shadow-green-500/30">
                  {initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-[#0d1117] bg-green-500" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900 dark:text-[#e6edf3]">{fullName}</p>
                <p className="truncate text-[11px] font-medium text-gray-500 dark:text-[#7d8590]">{email || "Signed in"}</p>
              </div>

              <div className="flex items-center gap-1 rounded-full bg-green-50 dark:bg-[#0d2818] px-2 py-1 ring-1 ring-green-100 dark:ring-green-900/50">
                <ShieldCheck className="h-3 w-3 text-[#22C55E]" strokeWidth={2.5} />
                <span className="text-[9px] font-black uppercase tracking-wider text-green-700 dark:text-green-400">
                  Active
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex gap-3 bg-white dark:bg-[#161b22] p-5">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            disabled={loggingOut}
            className="flex-1 rounded-xl border-2 border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-5 py-3 text-sm font-bold text-gray-700 dark:text-[#e6edf3] transition hover:border-gray-300 dark:hover:border-[#484f58] hover:bg-gray-50 dark:hover:bg-[#1c2128] focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-[#30363d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Stay signed in
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loggingOut}
            className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-red-600 px-5 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(239,68,68,0.4)] transition-all hover:shadow-[0_15px_40px_rgba(239,68,68,0.55)] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:scale-100"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            {loggingOut ? (
              <>
                <span className="relative z-10 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                <span className="relative z-10">Signing out…</span>
              </>
            ) : (
              <>
                <LogOut size={16} className="relative z-10" strokeWidth={2.5} />
                <span className="relative z-10">Yes, log out</span>
              </>
            )}
          </button>
        </div>

        {/* ── Footer hint ── */}
        <div className="border-t border-gray-100 dark:border-[#30363d] bg-gray-50/50 dark:bg-[#0d1117] px-6 py-2.5">
          <p className="text-center text-[10px] font-medium text-gray-400 dark:text-[#6e7681]">
            Tip: Press{" "}
            <kbd className="rounded border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] px-1.5 py-0.5 font-mono text-[9px] font-bold text-gray-600 dark:text-[#e6edf3] shadow-sm">
              Esc
            </kbd>{" "}
            to cancel
          </p>
        </div>
      </div>
    </div>
  );
}