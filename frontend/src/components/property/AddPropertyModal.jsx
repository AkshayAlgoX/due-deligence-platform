"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import {
  X,
  Home,
  MapPin,
  Building2,
  IndianRupee,
  Maximize,
  Hash,
  Loader2,
  Plus,
  Camera,
  Check,
  ChevronDown,
  Warehouse,
  Factory,
  Trees,
  Building,
  Bed,
  Bath,
  Layers,
  Calendar,
} from "lucide-react";

import { addProperty } from "@/services/propertyService";
import ImageUploader from "./ImageUploader";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { INDIAN_STATES, INDIAN_CITIES } from "@/constants/indianLocations";

const PROPERTY_TYPES = [
  { value: "Residential", label: "Residential",  icon: Home,      color: "text-blue-600 bg-blue-50",     desc: "Home, apartment, villa" },
  { value: "Commercial",  label: "Commercial",   icon: Building,  color: "text-purple-600 bg-purple-50", desc: "Office, retail, hotel" },
  { value: "Industrial",  label: "Industrial",   icon: Factory,   color: "text-orange-600 bg-orange-50", desc: "Warehouse, factory" },
  { value: "Land",        label: "Land",         icon: Trees,     color: "text-green-600 bg-green-50",   desc: "Plot, agricultural" },
  { value: "Mixed-Use",   label: "Mixed-Use",    icon: Warehouse, color: "text-indigo-600 bg-indigo-50", desc: "Residential + commercial" },
];

const INITIAL_FORM = {
  address: "",
  city: "",
  state: "",
  zipCode: "",
  propertyType: "",
  area: "",
  marketValue: "",
  yearBuilt: "",
  bedrooms: "",
  bathrooms: "",
  stories: "",
  imageUrl: null,
};

const VERIFICATION_FIELDS = [
  "address", "city", "state", "zipCode", "propertyType", "area", "marketValue",
];

const CURRENT_YEAR = new Date().getFullYear();

export default function AddPropertyModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const modalRef = useRef(null);
  const addressInputRef = useRef(null);
  const typeDropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM);
      setErrors({});
      setTimeout(() => addressInputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        if (typeDropdownOpen) setTypeDropdownOpen(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, typeDropdownOpen]);

  useEffect(() => {
    if (!typeDropdownOpen) return;
    const handler = (e) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [typeDropdownOpen]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSelectChange = (field) => (val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleTypeSelect = (type) => {
    setForm((prev) => ({ ...prev, propertyType: type }));
    setTypeDropdownOpen(false);
  };

  const handleImageChange = (url) => {
    setForm((prev) => ({ ...prev, imageUrl: url }));
  };

  const validate = () => {
    const e = {};

    if (!form.address.trim()) {
      e.address = "Address is required";
    } else if (form.address.trim().length <= 5) {
      e.address = "Address should be at least 6 characters";
    }

    if (!form.city.trim()) e.city = "City is required";

    if (form.zipCode.trim() && !/^\d{6}$/.test(form.zipCode.trim())) {
      e.zipCode = "PIN must be exactly 6 digits";
    }

    if (form.area && parseFloat(form.area) <= 0) {
      e.area = "Area must be greater than 0";
    }

    if (form.marketValue && parseFloat(form.marketValue) <= 0) {
      e.marketValue = "Value must be greater than 0";
    }

    if (form.yearBuilt) {
      const y = parseInt(form.yearBuilt);
      if (isNaN(y) || y < 1800 || y > CURRENT_YEAR) {
        e.yearBuilt = `Year must be between 1800 and ${CURRENT_YEAR}`;
      }
    }

    if (form.bedrooms && parseInt(form.bedrooms) < 0) {
      e.bedrooms = "Cannot be negative";
    }

    if (form.bathrooms && parseInt(form.bathrooms) < 0) {
      e.bathrooms = "Cannot be negative";
    }

    if (form.stories && (parseInt(form.stories) < 1 || parseInt(form.stories) > 200)) {
      e.stories = "Stories must be between 1 and 200";
    }

    return e;
  };

  const verificationStatus = useMemo(() => {
    let passed = 0;
    if (form.address.trim().length > 5) passed++;
    if (form.city.trim()) passed++;
    if (form.state.trim()) passed++;
    if (form.zipCode.trim() && /^\d{6}$/.test(form.zipCode.trim())) passed++;
    if (form.propertyType) passed++;
    if (form.area && parseFloat(form.area) > 0) passed++;
    if (form.marketValue && parseFloat(form.marketValue) > 0) passed++;
    const total = VERIFICATION_FIELDS.length;
    return { passed, total, percent: Math.round((passed / total) * 100) };
  }, [form]);

  const willBeVerified = verificationStatus.passed === verificationStatus.total;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Form has errors", {
  description: "Please review the highlighted fields below.",
});
      return;
    }

    setSubmitting(true);
    try {
      await addProperty({
        address:      form.address.trim(),
        city:         form.city.trim(),
        state:        form.state.trim() || null,
        zipCode:      form.zipCode.trim() || null,
        propertyType: form.propertyType || null,
        area:         form.area ? parseFloat(form.area) : null,
        marketValue:  form.marketValue ? parseFloat(form.marketValue) : null,
        yearBuilt:    form.yearBuilt ? parseInt(form.yearBuilt) : null,
        bedrooms:     form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms:    form.bathrooms ? parseInt(form.bathrooms) : null,
        stories:      form.stories ? parseInt(form.stories) : null,
        imageUrl:     form.imageUrl || null,
      });

      if (willBeVerified) {
        toast.success("Property added and fully verified", {
          description: "All 7 data quality checks passed.",
        });
      } else {
        const remaining = verificationStatus.total - verificationStatus.passed;
        toast.success("Property added", {
          description: `Complete ${remaining} more field${remaining === 1 ? "" : "s"} to fully verify it later.`,
        });
      }

      setForm(INITIAL_FORM);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Couldn't add property", {
  description: err.message || "Please try again in a moment.",
});
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedType = PROPERTY_TYPES.find((t) => t.value === form.propertyType);

  return (
    <div
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#22C55E] via-[#22C55E] to-[#16a34a] px-6 py-5 flex-shrink-0">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
              <Plus className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Add new property</h2>
              <p className="text-xs text-white/80 mt-0.5">
                Start with the basics — you can complete the rest anytime
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white transition hover:bg-white/30 backdrop-blur-sm"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Info banner */}
        <div className="flex-shrink-0 border-b border-gray-100 bg-gray-50/70 px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-shrink-0 h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
              <span className="text-[10px] font-black text-gray-600">i</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800">
                Only <span className="text-[#16a34a]">address</span> and <span className="text-[#16a34a]">city</span> are required
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Add remaining details anytime — properties can be completed after creation.
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 leading-tight">Verification</p>
                <p className={`text-sm font-black tabular-nums leading-tight ${
                  willBeVerified ? "text-[#16a34a]" : "text-gray-700"
                }`}>
                  {verificationStatus.passed}<span className="text-gray-400 font-bold">/{verificationStatus.total}</span>
                </p>
              </div>
              <div className="relative h-9 w-9 flex-shrink-0">
                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke={willBeVerified ? "#22C55E" : "#f59e0b"}
                    strokeWidth="3"
                    strokeDasharray={`${(verificationStatus.percent / 100) * 94.25} 94.25`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-[9px] font-black ${
                    willBeVerified ? "text-[#16a34a]" : "text-gray-700"
                  }`}>
                    {verificationStatus.percent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Location */}
          <FormSection title="Location" subtitle="Where is this property?">
            <Field label="Street address" icon={Home} required error={errors.address} hint={form.address ? `${form.address.length} characters` : null}>
              <input
                ref={addressInputRef}
                type="text"
                value={form.address}
                onChange={handleChange("address")}
                placeholder="742 Evergreen Terrace"
                disabled={submitting}
                className={inputCls(errors.address)}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="City" icon={Building2} required error={errors.city}>
                <div className="[&>div>button]:pl-10">
                  <SearchableSelect
                    value={form.city}
                    onChange={handleSelectChange("city")}
                    options={INDIAN_CITIES}
                    placeholder="Select or type city"
                    disabled={submitting}
                    error={Boolean(errors.city)}
                    allowCustom
                    icon={Building2}
                  />
                </div>
              </Field>

              <Field label="State" icon={MapPin} optional>
                <SearchableSelect
                  value={form.state}
                  onChange={handleSelectChange("state")}
                  options={INDIAN_STATES}
                  placeholder="Select state"
                  disabled={submitting}
                  icon={MapPin}
                />
              </Field>

              <Field label="PIN code" icon={Hash} optional error={errors.zipCode}>
                <input
                  type="text"
                  value={form.zipCode}
                  onChange={handleChange("zipCode")}
                  placeholder="560001"
                  maxLength={6}
                  inputMode="numeric"
                  disabled={submitting}
                  className={inputCls(errors.zipCode)}
                />
              </Field>
            </div>
          </FormSection>

          {/* Property details */}
          <FormSection title="Property details" subtitle="Help us classify and value it">
            <div ref={typeDropdownRef}>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Property type
                <span className="ml-1.5 rounded-md bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500">Optional</span>
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTypeDropdownOpen((prev) => !prev)}
                  disabled={submitting}
                  className={`
                    h-12 w-full rounded-xl border bg-white pl-3 pr-3
                    text-sm text-left outline-none transition
                    flex items-center justify-between gap-3
                    ${typeDropdownOpen ? "border-[#22C55E] ring-2 ring-green-100" : "border-gray-200 hover:border-gray-300"}
                    disabled:bg-gray-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {selectedType ? (
                      <>
                        <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${selectedType.color}`}>
                          <selectedType.icon className="h-4 w-4" strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate leading-tight">{selectedType.label}</p>
                          <p className="text-[11px] text-gray-500 truncate">{selectedType.desc}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <Building className="h-4 w-4 text-gray-400" />
                        </div>
                        <span className="text-gray-400">Choose a property type</span>
                      </>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${typeDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {typeDropdownOpen && (
                  <div className="absolute z-20 top-full mt-2 left-0 right-0 rounded-xl border border-gray-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {PROPERTY_TYPES.map((type) => {
                      const isActive = form.propertyType === type.value;
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleTypeSelect(type.value)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors border-b border-gray-50 last:border-b-0 ${isActive ? "bg-green-50" : "hover:bg-gray-50"}`}
                        >
                          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${type.color}`}>
                            <Icon className="h-4 w-4" strokeWidth={2.2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate leading-tight ${isActive ? "font-black text-[#16a34a]" : "font-bold text-gray-900"}`}>{type.label}</p>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">{type.desc}</p>
                          </div>
                          {isActive && <Check className="h-4 w-4 flex-shrink-0 text-[#22C55E]" strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Area" icon={Maximize} optional error={errors.area} hint="Square feet">
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

              <Field label="Market value" icon={IndianRupee} optional error={errors.marketValue} hint="Indian Rupees">
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
          </FormSection>

          {/* Extra details (NEW) */}
          <FormSection title="Extra details" subtitle="Optional — helps with reports and comparisons">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Year built" icon={Calendar} optional error={errors.yearBuilt}>
                <input
                  type="number"
                  value={form.yearBuilt}
                  onChange={handleChange("yearBuilt")}
                  placeholder="2015"
                  min="1800"
                  max={CURRENT_YEAR}
                  disabled={submitting}
                  className={inputCls(errors.yearBuilt)}
                />
              </Field>

              <Field label="Bedrooms" icon={Bed} optional error={errors.bedrooms}>
                <input
                  type="number"
                  value={form.bedrooms}
                  onChange={handleChange("bedrooms")}
                  placeholder="3"
                  min="0"
                  max="20"
                  disabled={submitting}
                  className={inputCls(errors.bedrooms)}
                />
              </Field>

              <Field label="Bathrooms" icon={Bath} optional error={errors.bathrooms}>
                <input
                  type="number"
                  value={form.bathrooms}
                  onChange={handleChange("bathrooms")}
                  placeholder="2"
                  min="0"
                  max="20"
                  disabled={submitting}
                  className={inputCls(errors.bathrooms)}
                />
              </Field>

              <Field label="Stories" icon={Layers} optional error={errors.stories}>
                <input
                  type="number"
                  value={form.stories}
                  onChange={handleChange("stories")}
                  placeholder="2"
                  min="1"
                  max="200"
                  disabled={submitting}
                  className={inputCls(errors.stories)}
                />
              </Field>
            </div>
          </FormSection>

          {/* Photo */}
          <FormSection title="Photo" subtitle="Add a photo or we'll use a smart placeholder">
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <Camera className="h-3.5 w-3.5 text-gray-500" />
                Property photo
                <span className="ml-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500">Optional</span>
              </label>
              <ImageUploader value={form.imageUrl} onChange={handleImageChange} disabled={submitting} />
              <p className="mt-2 text-[11px] text-gray-500">
                Skip this and we'll use a placeholder based on property type.
              </p>
            </div>
          </FormSection>
        </form>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50/70 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
              {willBeVerified ? (
                <>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-3.5 w-3.5 text-[#16a34a]" strokeWidth={3} />
                  </div>
                  <span className="font-semibold text-[#16a34a]">Will be instantly verified</span>
                </>
              ) : (
                <>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                    <span className="text-[10px] font-black text-amber-700">{verificationStatus.percent}%</span>
                  </div>
                  <span>
                    {verificationStatus.total - verificationStatus.passed} field{verificationStatus.total - verificationStatus.passed === 1 ? "" : "s"} to full verification
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-6 py-2.5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(34,197,94,0.35)] transition-all hover:shadow-[0_15px_35px_rgba(34,197,94,0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin relative z-10" />
                    <span className="relative z-10">Saving</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 relative z-10" strokeWidth={2.5} />
                    <span className="relative z-10">Add property</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, subtitle, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-900 tracking-tight">{title}</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, icon: Icon, required, optional, error, hint, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
          {optional && (
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500">Optional</span>
          )}
        </label>
        {hint && !error && <span className="text-[10px] text-gray-400">{hint}</span>}
      </div>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />}
        {children}
      </div>
      {error && (
        <p className="mt-1 text-[11px] font-medium text-red-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (hasError) =>
  `h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm text-gray-800 outline-none transition disabled:bg-gray-50 ${
    hasError
      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 focus:border-[#22C55E] focus:ring-2 focus:ring-green-100 hover:border-gray-300"
  }`;