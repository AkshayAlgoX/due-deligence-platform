// src/components/property/QuickImageUploadModal.jsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Camera, Loader2, Save, AlertTriangle } from "lucide-react";
import { updateProperty } from "@/services/propertyService";
import ImageUploader from "./ImageUploader";

/**
 * Small focused modal for updating just the property image.
 * Opens from the card's "Add photo" or "Change photo" button.
 * Does NOT touch any other fields.
 *
 * Note: Removing the photo inside ImageUploader only stages the change
 * locally — nothing persists until user clicks Save. Cancel discards it.
 */
export default function QuickImageUploadModal({
  isOpen,
  onClose,
  property,
  onSuccess,
}) {
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

    // Reset local state every time modal opens (not just on property change)
  useEffect(() => {
    if (isOpen && property) {
      setImageUrl(property.imageUrl ?? "");
    }
  }, [isOpen, property]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => e.key === "Escape" && !saving && onClose();
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, saving]);

  if (!isOpen || !property) return null;

  const originalImage = property.imageUrl ?? "";
  const hasChanged = imageUrl !== originalImage;
  const willRemove = originalImage && !imageUrl;   // staged deletion
  const willAdd = !originalImage && imageUrl;      // brand-new photo
  const willReplace = originalImage && imageUrl && imageUrl !== originalImage;

  // Action-specific save label
  const saveLabel = willRemove
    ? "Remove photo"
    : willReplace
    ? "Save changes"
    : willAdd
    ? "Save photo"
    : "No changes";

  const handleSave = async () => {
    if (!hasChanged) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      const payload = {
        address: property.address,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        propertyType: property.propertyType,
        area: property.area,
        marketValue: property.marketValue,
        yearBuilt: property.yearBuilt,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        imageUrl: imageUrl || null,
      };

      const updated = await updateProperty(property.id, payload);

      toast.success(
        willRemove ? "Photo removed" : "Photo updated",
        {
          description: willRemove
            ? "The property will now show a placeholder."
            : "Your property photo has been saved.",
        }
      );

      onSuccess?.(updated);
      onClose();
    } catch (err) {
      toast.error("Couldn't update photo", {
  description: err.message || "Please try again in a moment.",
});
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#22C55E] via-[#22C55E] to-[#16a34a] px-5 py-4">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
              <Camera className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-black text-white tracking-tight">
                {originalImage ? "Update photo" : "Add photo"}
              </h2>
              <p className="text-[11px] text-white/80 mt-0.5 truncate">
                {property.address}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white transition hover:bg-white/30 backdrop-blur-sm disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <ImageUploader
            value={imageUrl}
            onChange={setImageUrl}
            disabled={saving}
          />

          {/* Staged-removal warning */}
          {willRemove && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" strokeWidth={2.2} />
              <div className="flex-1">
                <p className="text-[11px] font-bold text-amber-800 leading-tight">
                  Photo staged for removal
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-snug">
                  Click <span className="font-bold">Remove photo</span> to confirm, or <span className="font-bold">Cancel</span> to keep the current photo.
                </p>
              </div>
            </div>
          )}

          {!willRemove && (
            <p className="mt-3 text-[11px] text-gray-500">
              {originalImage
                ? "Replace the current photo, or remove it to use a placeholder."
                : "Add a photo to help identify this property in search results."}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50/70 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanged}
            className={`
              flex items-center gap-2 rounded-xl
              px-5 py-2 text-sm font-bold text-white
              transition-all
              hover:scale-[1.02] active:scale-[0.98]
              disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed
              ${willRemove
                ? "bg-gradient-to-br from-red-500 to-red-600 shadow-[0_8px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_12px_30px_rgba(239,68,68,0.45)]"
                : "bg-gradient-to-br from-[#22C55E] to-[#16a34a] shadow-[0_8px_20px_rgba(34,197,94,0.3)] hover:shadow-[0_12px_30px_rgba(34,197,94,0.45)]"
              }
            `}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              <>
                <Save className="h-4 w-4" strokeWidth={2.5} />
                {saveLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}