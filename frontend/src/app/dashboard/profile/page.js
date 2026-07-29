"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  AlertTriangle,
  Loader2,
  Calendar,
  Pencil,
  Check,
  X,
  Lock,
  BadgeCheck,
  Briefcase,
} from "lucide-react";

import DeleteAccountModal from "@/components/profile/DeleteAccountModal";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import { getCurrentUser, updateProfile } from "@/services/authService";
import AvatarUploader from "@/components/profile/AvatarUploader";

export default function ProfilePage() {
  useEffect(() => {
    document.title = "Profile | Real Estate Due Diligence";
  }, []);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getCurrentUser();
        setUser(data);
        setFullName(data.fullName || "");
        setPhoneNumber(data.phoneNumber || "");
      } catch (err) {
        toast.error("Could not load profile", {
          description: err?.message || "Please refresh the page.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-sm text-gray-500">
          Unable to load profile. Please refresh the page.
        </p>
      </div>
    );
  }

  const providerLabel =
    {
      LOCAL: "Email + password",
      GOOGLE: "Google",
      LOCAL_AND_GOOGLE: "Email + Google",
    }[user.authProvider] || "—";

  const roleLabel =
    {
      BUYER: "Buyer",
      REAL_ESTATE_AGENT: "Real Estate Agent",
      LEGAL_REVIEWER: "Legal Reviewer",
      FINANCIAL_INSTITUTION: "Financial Institution",
      ADMIN: "Administrator",
    }[user.role] || "—";

  const roleTagline =
    {
      BUYER: "Property Buyer · Due Diligence",
      REAL_ESTATE_AGENT: "Real Estate Professional · Market Expert",
      LEGAL_REVIEWER: "Legal Advisor · Compliance Review",
      FINANCIAL_INSTITUTION: "Financial Institution · Asset Valuation",
      ADMIN: "System Administrator · Full Access",
    }[user.role] || "";

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const isGoogleOnly = user.authProvider === "GOOGLE";
  const isVerified = user.email && user.email.includes("@"); // Simple check — always true for signed-in users
  const initials = (user.fullName || user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const trimmedName = fullName.trim();
  const nameValid =
    trimmedName.length >= 3 &&
    trimmedName.length <= 100 &&
    /^[A-Za-zÀ-ÿ' .\-]+$/.test(trimmedName);
  const phoneValid = /^[6-9]\d{9}$/.test(phoneNumber);

  const hasChanges =
    trimmedName !== (user.fullName || "") ||
    phoneNumber !== (user.phoneNumber || "");

  const canSave = nameValid && phoneValid && hasChanges && !saving;

  function handleCancel() {
    setFullName(user.fullName || "");
    setPhoneNumber(user.phoneNumber || "");
    setEditing(false);
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const updated = await updateProfile({
        fullName: trimmedName,
        phoneNumber,
      });
      setUser(updated);
      setEditing(false);
      toast.success("Profile updated", {
        description: "Your changes have been saved.",
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Please try again.";
      toast.error("Update failed", { description: msg });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* ── Page title ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900">
          Account Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Control your professional identity and application security.
        </p>
      </div>

      {/* ── HERO BANNER CARD ─────────────────────────────────────────────── */}
<div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
  {/* Cover banner — Premium dark slate */}
  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    {/* Fine grid pattern */}
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage: `
          linear-gradient(to right, white 1px, transparent 1px),
          linear-gradient(to bottom, white 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    />
    {/* Subtle diagonal shine */}
    <div
      className="absolute inset-0 opacity-30"
      style={{
        backgroundImage:
          "linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
      }}
    />
    {/* Brand green accent glow */}
    <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#22C55E]/25 blur-3xl" />
    {/* Subtle blue accent */}
    <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />
    {/* Top-edge highlight */}
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  </div>

  {/* ── Body: Avatar row + info + action ────────────────────────────── */}
  <div className="px-8 pb-6">
    {/* Avatar floats up over banner */}
    <div className="flex justify-start -mt-16">
      <AvatarUploader
        user={user}
        size={128}
        onUpdated={(updated) => setUser(updated)}
      />
    </div>

    {/* Info row — comes BELOW avatar with proper spacing */}
    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      {/* Left: name + role */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {user.fullName || "User"}
          </h2>
          {isVerified && (
            <div className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 ring-1 ring-green-200">
              <BadgeCheck className="h-3.5 w-3.5 text-green-600" strokeWidth={2.5} />
              <span className="text-[10px] font-black text-green-700">
                Verified {roleLabel}
              </span>
            </div>
          )}
        </div>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500 font-medium">
          <Briefcase className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
          {roleTagline || user.email}
        </p>
      </div>

      {/* Right: Edit button */}
      <div className="flex-shrink-0">
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-[#22C55E] hover:text-[#16a34a] cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={2.4} />
            Edit profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.4} />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16a34a] px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)] transition hover:shadow-[0_8px_20px_rgba(34,197,94,0.4)] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
              )}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
</div>

      {/* ── ACCOUNT DETAILS SECTION ──────────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Account details
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            Primary contact and organizational information.
          </p>
        </div>

        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
          {editing ? (
            <EditRow
              icon={UserIcon}
              label="Full name"
              value={fullName}
              onChange={setFullName}
              placeholder="Your full name"
              error={
                fullName && !nameValid
                  ? "3–100 characters, letters and spaces only"
                  : null
              }
            />
          ) : (
            <InfoRow
              icon={UserIcon}
              label="Full name"
              value={user.fullName || "—"}
            />
          )}

          <InfoRow icon={Mail} label="Email address" value={user.email} locked />

          {editing ? (
            <EditRow
              icon={Phone}
              label="Phone"
              value={phoneNumber}
              onChange={(v) => setPhoneNumber(v.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile"
              prefix="+91"
              error={
                phoneNumber && !phoneValid
                  ? "10 digits, starting with 6–9"
                  : null
              }
            />
          ) : (
            <InfoRow
              icon={Phone}
              label="Phone"
              value={user.phoneNumber ? `+91 ${user.phoneNumber}` : "—"}
            />
          )}

          <InfoRow
            icon={Shield}
            label="Sign-in method"
            value={providerLabel}
            locked
          />
          <InfoRow icon={UserIcon} label="Access level" value={roleLabel} locked />
          <InfoRow
            icon={Calendar}
            label="Member since"
            value={memberSince}
            locked
          />
        </div>
      </section>

      {/* ── SECURITY SECTION ─────────────────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Security & access
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            Manage your authentication methods and security protocols.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#edf7f3] ring-1 ring-green-100">
                <Lock className="h-4 w-4 text-[#16a34a]" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-gray-900">Account password</p>
                <p className="mt-1 text-xs text-gray-500">
                  {isGoogleOnly
                    ? "You sign in with Google. No password is set."
                    : "Update your password anytime to keep your account secure."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              disabled={isGoogleOnly}
              className="flex-shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition hover:border-[#22C55E] hover:text-[#16a34a] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              Change password
            </button>
          </div>
        </div>
      </section>

      {/* ── DANGER ZONE ──────────────────────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-red-600">
            Danger zone
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Irreversible actions. Please proceed with care.
          </p>
        </div>

        <div className="rounded-2xl border-2 border-red-100 bg-red-50/30 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 ring-1 ring-red-200">
              <AlertTriangle
                className="h-4 w-4 text-red-600"
                strokeWidth={2.2}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gray-900">
                Delete this account
              </p>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                Permanently removes your profile, all properties you've added,
                and all session data. This cannot be undone.
              </p>

              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-600 shadow-sm transition hover:border-red-600 hover:bg-red-600 hover:text-white cursor-pointer"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <DeleteAccountModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        user={user}
      />
      <ChangePasswordModal
        isOpen={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value, locked = false }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-500 ring-1 ring-gray-100">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black uppercase tracking-wider text-gray-500">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-bold text-gray-900 truncate">
          {value}
        </p>
      </div>
      {locked && (
        <span className="flex-shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Locked
        </span>
      )}
    </div>
  );
}

function EditRow({ icon: Icon, label, value, onChange, placeholder, prefix, error }) {
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#edf7f3] text-[#16a34a] ring-1 ring-green-100">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500">
          {label}
        </label>
        <div className="mt-1 flex items-center gap-2">
          {prefix && (
            <span className="text-sm font-bold text-gray-500">{prefix}</span>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm font-semibold focus:border-[#22C55E] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20"
          />
        </div>
        {error && (
          <p className="mt-1 text-[11px] font-semibold text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}