"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Save, Loader2, CircleAlert, Check } from "lucide-react";
import { updateProperty } from "@/services/propertyService";

const PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Land",
  "Mixed-Use",
];

export default function EditPropertyModal({
  isOpen,
  onClose,
  property,
  onSuccess,
}) {
  // Initialize with ALL fields as empty strings — prevents uncontrolled warning
  const [form, setForm] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    propertyType: "",
    area: "",
    marketValue: "",
    yearBuilt: "",
    lotSize: "",
    zoning: "",
    bedrooms: "",
    bathrooms: "",
    stories: "",
    structureType: "",
    condition: "",
    imageUrl: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (property) {
      setForm({
        address: property.address ?? "",
        city: property.city ?? "",
        state: property.state ?? "",
        zipCode: property.zipCode ?? "",
        propertyType: property.propertyType ?? "",
        area: property.area ?? "",
        marketValue: property.marketValue ?? "",
        yearBuilt: property.yearBuilt ?? "",
        lotSize: property.lotSize ?? "",
        zoning: property.zoning ?? "",
        bedrooms: property.bedrooms ?? "",
        bathrooms: property.bathrooms ?? "",
        stories: property.stories ?? "",
        structureType: property.structureType ?? "",
        condition: property.condition ?? "",
        imageUrl: property.imageUrl ?? "",
      });
    }
  }, [property]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !property) return null;

  const missingFields = property.missingFields || [];
  const totalChecks = property.totalChecks || 7;
  const passedChecks = totalChecks - missingFields.length;
  const percent = Math.round((passedChecks / totalChecks) * 100);

  const isMissing = (fieldLabel) => missingFields.includes(fieldLabel);

  const handleChange = (field) => (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        area: form.area ? parseFloat(form.area) : null,
        marketValue: form.marketValue ? parseFloat(form.marketValue) : null,
        yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt) : null,
        lotSize: form.lotSize ? parseFloat(form.lotSize) : null,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        stories: form.stories ? parseInt(form.stories) : null,
      };

      const updated = await updateProperty(property.id, payload);

      if (updated.verified) {
        toast.success("Property verified", {
          description: "All data checks passed.",
        });
      } else {
        const stillMissing = updated.missingFields || [];
        toast.success("Changes saved", {
          description: `${stillMissing.length} field${stillMissing.length === 1 ? "" : "s"} still needed for verification.`,
        });
      }

      onSuccess?.(updated);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (fieldLabel) => `
    h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition
    ${isMissing(fieldLabel)
      ? "border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
      : "border-gray-200 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]"
    }
  `;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

        {/* ── Header — clean neutral, no amber ─────────────────── */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
              <CircleAlert className="h-4 w-4 text-gray-700" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                Complete property
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {property.address}
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

        {/* ── Data completeness card ───────────────────────────── */}
        <div className="px-6 pt-5">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                  Data completeness
                </p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {missingFields.length === 0
                    ? "All required fields completed"
                    : `${missingFields.length} of ${totalChecks} field${missingFields.length === 1 ? "" : "s"} missing`}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                  Complete
                </p>
                <p className="text-sm font-bold text-gray-900 tabular-nums">
                  {percent}%
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percent === 100 ? "bg-[#22C55E]" : "bg-gray-800"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>

            {missingFields.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {missingFields.map((field) => (
                  <span
                    key={field}
                    className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-700"
                  >
                    {field}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Form ─────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">
              Complete Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.address ?? ""}
              onChange={handleChange("address")}
              placeholder="123 Main Street, Apt 4B"
              className={inputClass("Complete Address")}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.city ?? ""}
                onChange={handleChange("city")}
                placeholder="Bangalore"
                className={inputClass("City")}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.state ?? ""}
                onChange={handleChange("state")}
                placeholder="Karnataka"
                className={inputClass("State")}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.zipCode ?? ""}
                onChange={handleChange("zipCode")}
                placeholder="560001"
                className={inputClass("ZIP Code")}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.propertyType ?? ""}
                onChange={handleChange("propertyType")}
                className={inputClass("Property Type")}
              >
                <option value="">Select</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                Market Value (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.marketValue ?? ""}
                onChange={handleChange("marketValue")}
                placeholder="12500000"
                min="0"
                className={inputClass("Market Value")}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                Area (sqft) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.area ?? ""}
                onChange={handleChange("area")}
                placeholder="1200"
                min="0"
                className={inputClass("Area (sqft)")}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-3">
              Optional
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Year Built</label>
                <input
                  type="number"
                  value={form.yearBuilt ?? ""}
                  onChange={handleChange("yearBuilt")}
                  placeholder="2015"
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Bedrooms</label>
                <input
                  type="number"
                  value={form.bedrooms ?? ""}
                  onChange={handleChange("bedrooms")}
                  placeholder="3"
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Bathrooms</label>
                <input
                  type="number"
                  value={form.bathrooms ?? ""}
                  onChange={handleChange("bathrooms")}
                  placeholder="2"
                  className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]"
                />
              </div>
            </div>
          </div>
        </form>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-3.5 flex items-center justify-between">
          <p className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
            <Check className="h-3.5 w-3.5" />
            Completing all fields marks the property as verified
          </p>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-white hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-gray-800 disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}