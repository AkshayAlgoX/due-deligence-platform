"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Loader2, X } from "lucide-react";

import { deleteAccount } from "@/services/authService";
import { removeToken } from "@/utils/helpers";

export default function DeleteAccountModal({ isOpen, onClose, user }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isGoogleOnly = user?.authProvider === "GOOGLE";
  const passwordLabel = isGoogleOnly
    ? "Type your email to confirm"
    : "Enter your password";
  const passwordPlaceholder = isGoogleOnly ? user?.email : "Current password";

  const handleDelete = async (e) => {
    e.preventDefault();

    if (confirmation !== "DELETE") {
      toast.error("Please type DELETE exactly to confirm");
      return;
    }

    if (!password.trim()) {
      toast.error(isGoogleOnly ? "Enter your email" : "Enter your password");
      return;
    }

    setLoading(true);
    try {
      const res = await deleteAccount({
        password: password.trim(),
        confirmation,
      });

      if (res.success) {
        toast.success("Account deleted", {
          description: "You'll be redirected in a moment.",
        });
        removeToken();
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        toast.error(res.message || "Could not delete account");
      }
    } catch (err) {
      toast.error("Could not delete account", {
        description: err?.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Delete account</h2>
              <p className="text-xs text-gray-500">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-red-100 bg-red-50/60 p-4">
          <p className="text-sm font-semibold text-red-900">
            The following will be permanently deleted:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-red-800">
            <li>• Your account and profile</li>
            <li>• All properties you added</li>
            <li>• All your session data</li>
          </ul>
        </div>

        <form onSubmit={handleDelete} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">
              {passwordLabel}
            </label>
            <input
              type={isGoogleOnly ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={passwordPlaceholder}
              disabled={loading}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:bg-gray-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Type <span className="font-mono font-black">DELETE</span> to
              confirm
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
              disabled={loading}
              autoComplete="off"
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-mono outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:bg-gray-50"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading || confirmation !== "DELETE" || !password.trim()
              }
              className="flex-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}