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
} from "lucide-react";

import DeleteAccountModal from "@/components/profile/DeleteAccountModal";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import { getCurrentUser, updateProfile } from "@/services/authService";

export default function ProfilePage() {
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
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
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
    }[user.authProvider] || user.authProvider || "—";

  const roleLabel =
    {
      BUYER: "Buyer",
      REAL_ESTATE_AGENT: "Real estate agent",
      LEGAL_REVIEWER: "Legal reviewer",
      FINANCIAL_INSTITUTION: "Financial institution",
      ADMIN: "Administrator",
    }[user.role] || user.role || "—";

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const isGoogleOnly = user.authProvider === "GOOGLE";

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
    <div className="mx-auto w-full max-w-3xl space-y-12">
      <div>
        <h1 className="text-[32px] font-extrabold tracking-tight text-gray-900">
          Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500">Your account details.</p>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Account
          </h2>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-[#22C55E] hover:text-[#16a34a]"
            >
              <Pencil className="h-3 w-3" strokeWidth={2.4} />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                <X className="h-3 w-3" strokeWidth={2.4} />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#22C55E] to-[#16a34a] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" strokeWidth={2.4} />
                )}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
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

          <InfoRow icon={Mail} label="Email" value={user.email} locked />

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
          <InfoRow icon={UserIcon} label="Role" value={roleLabel} locked />
          <InfoRow
            icon={Calendar}
            label="Member since"
            value={memberSince}
            locked
          />
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Security
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#edf7f3]">
                <Lock className="h-4 w-4 text-[#16a34a]" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900">Password</p>
                <p className="mt-1 text-xs text-gray-600">
                  {isGoogleOnly
                    ? "You sign in with Google. No password is set."
                    : "Update your password anytime."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              disabled={isGoogleOnly}
              className="flex-shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-[#22C55E] hover:text-[#16a34a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Change password
            </button>
          </div>
        </div>
      </section>

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
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle
                className="h-4 w-4 text-red-600"
                strokeWidth={2.2}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">
                Delete this account
              </p>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                Permanently removes your profile, all properties you've added,
                and all session data. This cannot be undone.
              </p>

              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="mt-4 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:border-red-600 hover:bg-red-600 hover:text-white"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      </section>

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

function InfoRow({ icon: Icon, label, value, locked = false }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-gray-900 truncate">
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
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#edf7f3] text-[#16a34a]">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </label>
        <div className="mt-1 flex items-center gap-2">
          {prefix && (
            <span className="text-sm font-medium text-gray-500">{prefix}</span>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-[#22C55E] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20"
          />
        </div>
        {error && (
          <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}