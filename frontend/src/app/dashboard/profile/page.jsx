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
} from "lucide-react";

import DeleteAccountModal from "@/components/profile/DeleteAccountModal";
import { getCurrentUser } from "@/services/authService";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getCurrentUser();
        setUser(data);
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

  return (
    <div className="mx-auto w-full max-w-3xl space-y-12">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h1 className="text-[32px] font-extrabold tracking-tight text-gray-900">
          Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500">Your account details.</p>
      </div>

      {/* ── Account details (list style) ────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Account
          </h2>
          <span className="text-[11px] text-gray-400">Read-only</span>
        </div>

        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
          <InfoRow
            icon={UserIcon}
            label="Full name"
            value={user.fullName || "—"}
          />
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow
            icon={Phone}
            label="Phone"
            value={user.phoneNumber ? `+91 ${user.phoneNumber}` : "—"}
          />
          <InfoRow
            icon={Shield}
            label="Sign-in method"
            value={providerLabel}
          />
          <InfoRow icon={UserIcon} label="Role" value={roleLabel} />
          <InfoRow icon={Calendar} label="Member since" value={memberSince} />
        </div>
      </section>

      {/* ── Danger zone ─────────────────────────────────────── */}
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
              <AlertTriangle className="h-4 w-4 text-red-600" strokeWidth={2.2} />
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
    </div>
  );
}

// ── Info row (list-item style) ────────────────────────────────
function InfoRow({ icon: Icon, label, value }) {
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
    </div>
  );
}