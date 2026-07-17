"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  X,
  Home,
  MapPin,
  Building2,
  IndianRupee,
  Maximize,
  Hash,
  Tag,
  Loader2,
  Plus,
} from "lucide-react";

import { addProperty } from "@/services/propertyService";

const PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Industrial",
  "Land",
  "Mixed-Use",
];

const INITIAL_FORM = {
  address: "",
  city: "",
  state: "",
  zipCode: "",
  propertyType: "Residential",
  area: "",
  marketValue: "",
};

export default function AddPropertyModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef(null);

  // ── Close on Escape key ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden"; // Lock scroll

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // ── Close on backdrop click ────────────────────────────────────────────────
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // ── Form change handler ────────────────────────────────────────────────────
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.zipCode.trim()) e.zipCode = "ZIP code is required";
    else if (!/^\d{5,6}$/.test(form.zipCode.trim()))
      e.zipCode = "ZIP must be 5–6 digits";
    if (!form.area || parseFloat(form.area) <= 0)
      e.area = "Area must be greater than 0";
    if (!form.marketValue || parseFloat(form.marketValue) <= 0)
      e.marketValue = "Market value must be greater than 0";
    return e;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Please fix the errors in the form.");
      return;
    }

    setSubmitting(true);
    try {
      await addProperty({
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zipCode: form.zipCode.trim(),
        propertyType: form.propertyType,
        area: parseFloat(form.area),
        marketValue: parseFloat(form.marketValue),
      });

      toast.success("Property added successfully! 🎉");
      setForm(INITIAL_FORM);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to add property");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200"
      >

        {/* ── Header ── */}
        <div className="relative bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Plus className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add New Property</h2>
              <p className="text-xs text-white/80">
                Fill in the details to register a new property
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-1.5 text-white transition hover:bg-white/30"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">

          {/* Address */}
          <Field
            label="Street Address"
            icon={Home}
            required
            error={errors.address}
          >
            <input
              type="text"
              value={form.address}
              onChange={handleChange("address")}
              placeholder="742 Evergreen Terrace"
              disabled={submitting}
              className={inputCls(errors.address)}
            />
          </Field>

          {/* City + State */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Field label="City" icon={Building2} required error={errors.city}>
              <input
                type="text"
                value={form.city}
                onChange={handleChange("city")}
                placeholder="Springfield"
                disabled={submitting}
                className={inputCls(errors.city)}
              />
            </Field>

            <Field label="State" icon={MapPin} required error={errors.state}>
              <input
                type="text"
                value={form.state}
                onChange={handleChange("state")}
                placeholder="OR"
                disabled={submitting}
                className={inputCls(errors.state)}
              />
            </Field>
          </div>

          {/* ZIP + Type */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Field label="ZIP Code" icon={Hash} required error={errors.zipCode}>
              <input
                type="text"
                value={form.zipCode}
                onChange={handleChange("zipCode")}
                placeholder="97477"
                maxLength={6}
                disabled={submitting}
                className={inputCls(errors.zipCode)}
              />
            </Field>

            <Field label="Property Type" icon={Tag} required>
              <select
                value={form.propertyType}
                onChange={handleChange("propertyType")}
                disabled={submitting}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm text-gray-800 outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Area + Market Value */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Field
              label="Area (sqft)"
              icon={Maximize}
              required
              error={errors.area}
            >
              <input
                type="number"
                value={form.area}
                onChange={handleChange("area")}
                placeholder="1800"
                min="0"
                step="1"
                disabled={submitting}
                className={inputCls(errors.area)}
              />
            </Field>

            <Field
              label="Market Value (₹)"
              icon={IndianRupee}
              required
              error={errors.marketValue}
            >
              <input
                type="number"
                value={form.marketValue}
                onChange={handleChange("marketValue")}
                placeholder="15000000"
                min="0"
                step="1"
                disabled={submitting}
                className={inputCls(errors.marketValue)}
              />
            </Field>
          </div>

          {/* ── Actions ── */}
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-[#22C55E] px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition hover:bg-[#16a34a] disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding…
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Property
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Reusable Field wrapper ────────────────────────────────────────────────────
function Field({ label, icon: Icon, required, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        )}
        {children}
      </div>

      {error && (
        <p className="mt-1 text-[11px] font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

// ── Reusable input classes ────────────────────────────────────────────────────
const inputCls = (hasError) =>
  `h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-gray-800 outline-none transition disabled:bg-gray-50 ${
    hasError
      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 focus:border-[#22C55E] focus:ring-2 focus:ring-green-100"
  }`;