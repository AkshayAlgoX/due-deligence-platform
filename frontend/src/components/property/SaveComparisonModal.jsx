"use client";

import { useEffect, useRef, useState } from "react";
import { X, Bookmark, Loader2, BookmarkCheck } from "lucide-react";

export default function SaveComparisonModal({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
  propertyIds = [],
  defaultName = "",
}) {
  const modalRef = useRef(null);
  const nameInputRef = useRef(null);

  const [name, setName] = useState(defaultName);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Reset state when modal opens ──────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setName(defaultName || "");
      setNotes("");
      setSaved(false);
      setErrors({});
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultName]);

  // ── Keyboard + scroll lock ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape" && !isSaving) onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, isSaving, onClose]);

  // ── Backdrop click ────────────────────────────────────────────────────────
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target) && !isSaving) {
      onClose();
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    else if (name.trim().length < 3) errs.name = "Name must be at least 3 characters";
    else if (name.trim().length > 100) errs.name = "Name cannot exceed 100 characters";
    if (notes.length > 1000) errs.notes = "Notes cannot exceed 1000 characters";
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      await onSave({ name: name.trim(), notes: notes.trim(), propertyIds });
      setSaved(true);
      setTimeout(() => onClose(), 1200);
    } catch {
      // error toast handled by hook — modal stays open
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-comparison-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_25px_80px_rgba(0,0,0,0.25)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ring-1 ring-black/5"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 px-6 pt-8 pb-6">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(34,197,94,0.08) 1px, transparent 1px)`,
              backgroundSize: "18px 18px",
            }}
          />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-1.5 text-gray-500 shadow-sm ring-1 ring-black/5 backdrop-blur-sm transition hover:bg-white hover:text-gray-700 disabled:opacity-50 cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon */}
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
            <span className="absolute h-full w-full rounded-3xl bg-gradient-to-br from-green-100 to-emerald-200" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] shadow-lg shadow-green-500/40 ring-4 ring-white">
              {saved ? (
                <BookmarkCheck className="h-6 w-6 text-white" strokeWidth={2.5} />
              ) : (
                <Bookmark className="h-6 w-6 text-white" strokeWidth={2.5} />
              )}
            </div>
          </div>

          <h2
            id="save-comparison-title"
            className="mt-4 text-center text-xl font-black tracking-tight text-gray-900"
          >
            {saved ? "Comparison saved!" : "Save comparison"}
          </h2>
          <p className="mx-auto mt-1.5 max-w-xs text-center text-[13px] leading-relaxed text-gray-500">
            {saved
              ? "You can load this comparison anytime from your saved list."
              : `Save this ${propertyIds.length}-property comparison to your account.`}
          </p>
        </div>

        {/* ── Form ────────────────────────────────────────────────────────── */}
        {!saved && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-4">

              {/* Name */}
              <div>
                <label
                  htmlFor="comparison-name"
                  className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="comparison-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. Mumbai vs Pune comparison"
                  maxLength={100}
                  disabled={isSaving}
                  className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-300 outline-none transition focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                    errors.name
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#22C55E] focus:ring-green-100"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs font-semibold text-red-500">{errors.name}</p>
                )}
                <p className="mt-1 text-right text-[10px] text-gray-400 tabular-nums">
                  {name.length}/100
                </p>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="comparison-notes"
                  className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5"
                >
                  Notes <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  id="comparison-notes"
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    if (errors.notes) setErrors((prev) => ({ ...prev, notes: undefined }));
                  }}
                  placeholder="Add any notes about this comparison..."
                  maxLength={1000}
                  rows={3}
                  disabled={isSaving}
                  className={`w-full resize-none rounded-xl border px-4 py-3 text-sm font-semibold text-gray-900 placeholder:text-gray-300 outline-none transition focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                    errors.notes
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#22C55E] focus:ring-green-100"
                  }`}
                />
                {errors.notes && (
                  <p className="mt-1 text-xs font-semibold text-red-500">{errors.notes}</p>
                )}
                <p className="mt-1 text-right text-[10px] text-gray-400 tabular-nums">
                  {notes.length}/1000
                </p>
              </div>

              {/* Properties count pill */}
              <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 ring-1 ring-gray-100">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22C55E] text-[10px] font-black text-white">
                  {propertyIds.length}
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  {propertyIds.length} {propertyIds.length === 1 ? "property" : "properties"} will be saved in this comparison
                </span>
              </div>
            </div>

            {/* ── Actions ──────────────────────────────────────────────────── */}
            <div className="flex gap-3 border-t border-gray-100 bg-white px-6 py-5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.4)] transition-all hover:shadow-[0_15px_40px_rgba(34,197,94,0.55)] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:scale-100 cursor-pointer"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                {isSaving ? (
                  <>
                    <Loader2 className="relative z-10 h-4 w-4 animate-spin" />
                    <span className="relative z-10">Saving...</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="relative z-10 h-4 w-4" strokeWidth={2.5} />
                    <span className="relative z-10">Save comparison</span>
                  </>
                )}
              </button>
            </div>

            {/* Footer hint */}
            <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-2.5">
              <p className="text-center text-[10px] font-medium text-gray-400">
                Tip: Press{" "}
                <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-mono text-[9px] font-bold text-gray-600 shadow-sm">
                  Esc
                </kbd>{" "}
                to cancel
              </p>
            </div>
          </form>
        )}

        {/* ── Success state (no form) ──────────────────────────────────────── */}
        {saved && (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-500">Closing automatically...</p>
          </div>
        )}
      </div>
    </div>
  );
}