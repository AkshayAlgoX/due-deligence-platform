"use client";

import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Camera,
  Loader2,
  Upload,
  Trash2,
  X,
  Check,
} from "lucide-react";
import {
  uploadToCloudinary,
  validateImageFile,
} from "@/services/cloudinaryService";
import { updateProfile } from "@/services/authService";
import { updateStoredUser } from "@/utils/helpers";

export default function AvatarUploader({
  user,
  onUpdated,
  size = 112,
}) {
  const fileInputRef = useRef(null);
  const avatarRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [removing, setRemoving] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const initials = (user?.fullName || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hasPhoto = !!user?.profilePicture;

  const openMenu = () => {
    if (!avatarRef.current) return;
    const rect = avatarRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 12,
      left: rect.left + rect.width / 2,
    });
    setShowMenu(true);
  };

  useEffect(() => {
    if (!showMenu) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setShowMenu(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showMenu]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateImageFile(file);
    } catch (err) {
      toast.error("Invalid file", { description: err.message });
      e.target.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    setSelectedFile(file);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(0);

    try {
      const { url } = await uploadToCloudinary(selectedFile, (p) =>
        setProgress(p)
      );

      const updated = await updateProfile({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        profilePicture: url,
      });

      updateStoredUser({ profilePicture: updated.profilePicture });

      toast.success("Profile photo updated");
      onUpdated?.(updated);
      handleCancel();
    } catch (err) {
      toast.error("Upload failed", {
        description: err?.message || "Please try again.",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleCancel = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = async () => {
    if (!hasPhoto) return;
    setRemoving(true);
    setShowMenu(false);

    try {
      const updated = await updateProfile({
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        profilePicture: "",
      });

      updateStoredUser({ profilePicture: null });

      toast.success("Profile photo removed");
      onUpdated?.(updated);
    } catch (err) {
      toast.error("Failed to remove photo", {
        description: err?.message || "Please try again.",
      });
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* ── Avatar Display ────────────────────────────────────────────────── */}
      <div
        ref={avatarRef}
        className="relative group"
        style={{ width: size, height: size }}
      >
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={user.fullName}
            className="h-full w-full rounded-2xl border-4 border-white dark:border-[#161b22] object-cover shadow-lg"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}

        <div
          className={`${user?.profilePicture ? "hidden" : "flex"} h-full w-full items-center justify-center rounded-2xl border-4 border-white dark:border-[#161b22] bg-gradient-to-br from-[#22C55E] to-[#16a34a] font-black text-white shadow-lg`}
          style={{ fontSize: `${size * 0.32}px` }}
        >
          {initials}
        </div>

        <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white dark:border-[#161b22] bg-green-500 z-10" />

        <button
          type="button"
          onClick={openMenu}
          disabled={uploading || removing}
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 opacity-0 transition-all duration-200 hover:bg-black/50 hover:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed cursor-pointer z-20"
          aria-label="Change profile photo"
        >
          {removing ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" strokeWidth={2.2} />
          )}
        </button>

        <button
          type="button"
          onClick={openMenu}
          disabled={uploading || removing}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-[#1c2128] shadow-md ring-2 ring-white dark:ring-[#161b22] transition hover:scale-110 hover:bg-gray-50 dark:hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer z-30"
          aria-label="Photo options"
        >
          <Camera className="h-4 w-4 text-gray-700 dark:text-[#e6edf3]" strokeWidth={2.4} />
        </button>
      </div>

      {/* ── Photo action menu ─────────────────────────────────────────── */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowMenu(false)}
          />
          <div
            className="fixed z-[9998] w-60 rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              transform: "translateX(-50%)",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                fileInputRef.current?.click();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-gray-700 dark:text-[#e6edf3] transition hover:bg-green-50 dark:hover:bg-[#0d2818] hover:text-[#16a34a] dark:hover:text-green-400 cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 dark:bg-[#0d2818]">
                <Upload className="h-4 w-4 text-[#16a34a] dark:text-green-400" strokeWidth={2.2} />
              </div>
              {hasPhoto ? "Change photo" : "Upload photo"}
            </button>

            {hasPhoto && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-gray-700 dark:text-[#e6edf3] transition hover:bg-red-50 dark:hover:bg-[#2d1214] hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-[#2d1214]">
                  <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" strokeWidth={2.2} />
                </div>
                Remove photo
              </button>
            )}

            <div className="mt-1 border-t border-gray-100 dark:border-[#30363d] px-3 pt-2 pb-1">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-[#6e7681]">
                JPG, PNG, WebP · Max 5 MB
              </p>
            </div>
          </div>
        </>
      )}

      {/* ── Upload confirmation modal ──────────────────────────────────── */}
      {preview && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#161b22] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#30363d] px-6 py-4">
              <h3 className="text-base font-black text-gray-900 dark:text-[#e6edf3]">
                Preview & upload
              </h3>
              <button
                type="button"
                onClick={handleCancel}
                disabled={uploading}
                className="rounded-full p-1.5 text-gray-400 dark:text-[#7d8590] hover:bg-gray-100 dark:hover:bg-[#1c2128] hover:text-gray-700 dark:hover:text-[#e6edf3] disabled:opacity-50 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-6 flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-40 w-40 rounded-2xl object-cover ring-4 ring-green-50 dark:ring-[#0d2818] shadow-lg"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-white mx-auto" />
                      <p className="mt-2 text-xs font-black text-white">
                        {progress}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm font-black text-gray-900 dark:text-[#e6edf3]">
                  {selectedFile?.name}
                </p>
                <p className="text-xs text-gray-400 dark:text-[#6e7681] mt-0.5">
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(0)} KB`
                    : ""}
                </p>
              </div>

              {uploading && (
                <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-[#1c2128] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#22C55E] to-[#16a34a] transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-gray-100 dark:border-[#30363d] bg-gray-50/50 dark:bg-[#0d1117] px-6 py-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={uploading}
                className="flex-1 rounded-xl border-2 border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-[#e6edf3] transition hover:bg-gray-50 dark:hover:bg-[#30363d] disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpload}
                disabled={uploading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16a34a] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg disabled:opacity-70 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                    Upload photo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}