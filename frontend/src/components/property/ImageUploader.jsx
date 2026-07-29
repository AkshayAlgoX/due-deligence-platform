"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { uploadToCloudinary, validateImageFile } from "@/services/cloudinaryService";

export default function ImageUploader({ value, onChange, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    async (file) => {
      setError("");

      try {
        validateImageFile(file);
      } catch (err) {
        setError(err.message);
        toast.error("Upload failed", {
          description: err.message || "Please try again in a moment.",
        });
        return;
      }

      const localUrl = URL.createObjectURL(file);
      setPreviewFile({ file, localUrl });

      setUploading(true);
      setProgress(0);

      try {
        const result = await uploadToCloudinary(file, (percent) => {
          setProgress(percent);
        });

        onChange?.(result.url);
        toast.success("Photo uploaded", {
          description: "Your property photo is now live.",
        });
      } catch (err) {
        setError(err.message);
        toast.error("Upload failed", {
          description: err.message || "Please try again in a moment.",
        });
        setPreviewFile(null);
      } finally {
        setUploading(false);
        setProgress(0);
        setTimeout(() => URL.revokeObjectURL(localUrl), 1000);
      }
    },
    [onChange]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    setPreviewFile(null);
    setError("");
    onChange?.(null);
  };

  const openFilePicker = () => {
    if (!disabled && !uploading) inputRef.current?.click();
  };

  const displayUrl = previewFile?.localUrl || value;
  const hasImage = Boolean(displayUrl);

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* ── EMPTY STATE: Drop Zone ── */}
      {!hasImage && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFilePicker}
          className={`
            group relative flex flex-col items-center justify-center
            rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer
            ${
              isDragging
                ? "border-[#22C55E] bg-green-50/70 dark:bg-[#0d2818]/70 scale-[1.01]"
                : "border-gray-300 dark:border-[#30363d] bg-gray-50/50 dark:bg-[#0d1117]/50 hover:border-[#22C55E] hover:bg-green-50/30 dark:hover:bg-[#0d2818]/30"
            }
            ${disabled || uploading ? "cursor-not-allowed opacity-60" : ""}
          `}
        >
          {/* Icon */}
          <div
            className={`
              flex h-14 w-14 items-center justify-center rounded-2xl transition-all
              ${
                isDragging
                  ? "bg-[#22C55E] scale-110"
                  : "bg-white dark:bg-[#161b22] ring-1 ring-gray-200 dark:ring-[#30363d] group-hover:bg-[#22C55E] group-hover:ring-0"
              }
            `}
          >
            <Upload
              className={`h-6 w-6 transition-colors ${
                isDragging
                  ? "text-white"
                  : "text-gray-400 dark:text-[#6e7681] group-hover:text-white"
              }`}
              strokeWidth={2}
            />
          </div>

          {/* Text */}
          <p className="mt-3 text-sm font-bold text-gray-700 dark:text-[#e6edf3]">
            {isDragging ? "Drop image here" : "Drag & drop or click to upload"}
          </p>
          <p className="mt-1 text-[11px] font-medium text-gray-500 dark:text-[#7d8590]">
            JPG, PNG, or WebP · up to 5 MB
          </p>

          {/* Error message */}
          {error && (
            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-[#2d1214] px-3 py-1.5 ring-1 ring-red-100 dark:ring-red-900/50">
              <AlertCircle className="h-3.5 w-3.5 text-red-500" />
              <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* ── PREVIEW STATE: Image with actions ── */}
      {hasImage && (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
          {/* Image preview */}
          <div className="relative h-52 w-full overflow-hidden bg-gray-100 dark:bg-[#1c2128]">
            <img
              src={displayUrl}
              alt="Property preview"
              className="h-full w-full object-cover"
            />

            {/* Upload progress overlay — stays white (on top of photo) */}
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <p className="mt-2 text-xs font-bold text-white">
                  Uploading... {progress}%
                </p>
                <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full bg-gradient-to-r from-[#22C55E] to-[#16a34a] transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success badge — stays white (over photo) */}
            {!uploading && value && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 shadow-lg backdrop-blur-md ring-1 ring-white/40">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-800">
                  Uploaded
                </span>
              </div>
            )}
          </div>

          {/* Footer with actions */}
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-[#30363d] bg-gradient-to-b from-white dark:from-[#161b22] to-gray-50/50 dark:to-[#1c2128]/50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[11px]">
              {uploading ? (
                <span className="font-semibold text-gray-500 dark:text-[#7d8590]">
                  Uploading to Cloudinary…
                </span>
              ) : value ? (
                <span className="font-semibold text-gray-600 dark:text-[#7d8590]">
                  ✨ Ready — will save with property
                </span>
              ) : (
                <span className="font-semibold text-gray-500 dark:text-[#7d8590]">Preparing…</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={openFilePicker}
                disabled={disabled || uploading}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-gray-600 dark:text-[#7d8590] transition hover:bg-gray-100 dark:hover:bg-[#1c2128] disabled:opacity-50"
              >
                <RefreshCw className="h-3 w-3" />
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || uploading}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-[#2d1214] disabled:opacity-50"
              >
                <X className="h-3 w-3" />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}