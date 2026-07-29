"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ShieldOff,
  X,
  AlertTriangle,
  Loader2,
  MonitorSmartphone,
} from "lucide-react";
import { logoutAllDevices } from "@/services/authService";
import { removeToken } from "@/utils/helpers";

export default function SignOutAllModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setProcessing(false);
    setTimeout(() => cancelBtnRef.current?.focus(), 100);

    const handleKey = (e) => {
      if (e.key === "Escape" && !processing) onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, processing]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target) && !processing) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      await logoutAllDevices();

      toast.success("Signed out everywhere", {
        description: "All your active sessions have been ended.",
      });

      setTimeout(() => {
        removeToken();
        router.push("/login");
      }, 800);
    } catch (err) {
      toast.error("Could not sign out", {
        description: err?.message || "Please try again.",
      });
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-all-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-[#161b22] shadow-[0_25px_80px_rgba(0,0,0,0.25)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.6)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ring-1 ring-black/5 dark:ring-[#30363d]"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 dark:bg-[#161b22]/80 p-1.5 text-gray-500 dark:text-[#e6edf3] shadow-sm ring-1 ring-black/5 dark:ring-[#30363d] backdrop-blur-sm transition hover:bg-white dark:hover:bg-[#1c2128] hover:text-gray-700 dark:hover:text-white disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ── Header: Red gradient (dimmed in dark) ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-rose-50 to-red-50 dark:from-[#2d1214] dark:via-[#3a0a0a] dark:to-[#2d1214] px-6 pt-10 pb-8">
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(239,68,68,0.08) 1px, transparent 1px)`,
              backgroundSize: "18px 18px",
            }}
          />

          {/* Icon with pulse */}
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <span className="absolute h-full w-full animate-ping rounded-3xl bg-red-400/30" />
            <span className="absolute h-full w-full rounded-3xl bg-gradient-to-br from-red-100 to-rose-200 dark:from-red-900/50 dark:to-rose-900/50" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/40 ring-4 ring-white dark:ring-[#161b22]">
              <ShieldOff className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h2
            id="signout-all-title"
            className="mt-5 text-center text-[22px] font-black tracking-tight text-gray-900 dark:text-[#e6edf3]"
          >
            Sign out of all devices?
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-center text-[13px] leading-relaxed text-gray-600 dark:text-[#e6edf3]/80">
            This will end your session on <span className="font-bold">every device</span>{" "}
            currently signed in with this account.
          </p>
        </div>

        {/* ── Impact list ── */}
        <div className="border-y border-gray-100 dark:border-[#30363d] bg-gradient-to-b from-white to-gray-50/50 dark:from-[#161b22] dark:to-[#0d1117] px-6 py-5">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-[#2d1214] ring-1 ring-red-100 dark:ring-red-900">
                <MonitorSmartphone className="h-4 w-4 text-red-500 dark:text-red-400" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
                  All active sessions will end
                </p>
                <p className="text-[12px] text-gray-500 dark:text-[#7d8590] mt-0.5">
                  Phones, tablets, other browsers — everywhere you're signed in
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-[#282a10] ring-1 ring-amber-100 dark:ring-amber-900">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-[#e6edf3]">
                  You'll be logged out here too
                </p>
                <p className="text-[12px] text-gray-500 dark:text-[#7d8590] mt-0.5">
                  You'll need to sign in again to continue
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-amber-50/60 dark:bg-[#282a10]/60 ring-1 ring-amber-100 dark:ring-amber-900 px-3 py-2.5">
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <span className="font-black">Use this if:</span> your account may be
              compromised, you shared your device, or you forgot to log out somewhere.
            </p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 bg-white dark:bg-[#161b22] p-5">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onClose}
            disabled={processing}
            className="flex-1 rounded-xl border-2 border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] px-5 py-3 text-sm font-bold text-gray-700 dark:text-[#e6edf3] transition hover:border-gray-300 dark:hover:border-[#484f58] hover:bg-gray-50 dark:hover:bg-[#30363d] focus:outline-none focus:ring-4 focus:ring-gray-100 dark:focus:ring-[#30363d] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing}
            className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-red-600 px-5 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(239,68,68,0.4)] transition-all hover:shadow-[0_15px_40px_rgba(239,68,68,0.55)] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:scale-100"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

            {processing ? (
              <>
                <Loader2 className="relative z-10 h-4 w-4 animate-spin" />
                <span className="relative z-10">Signing out everywhere…</span>
              </>
            ) : (
              <>
                <ShieldOff size={16} className="relative z-10" strokeWidth={2.5} />
                <span className="relative z-10">Yes, sign out everywhere</span>
              </>
            )}
          </button>
        </div>

        {/* Footer hint */}
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