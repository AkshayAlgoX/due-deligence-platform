"use client";

import { useState, useEffect } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import DeleteAccountModal from "@/components/profile/DeleteAccountModal";
import { getUser } from "@/utils/helpers";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const provider = user.authProvider || "LOCAL";
  const providerLabel = {
    LOCAL: "Email + password",
    GOOGLE: "Google",
    LOCAL_AND_GOOGLE: "Email + Google",
  }[provider] || provider;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-extrabold tracking-tight text-gray-900">
          Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Your account details.
        </p>
      </div>

      {/* Account info card */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900">Account details</h2>

        <div className="mt-4 space-y-3">
          <InfoRow icon={UserIcon} label="Full name" value={user.fullName || "—"} />
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
          <InfoRow
            icon={UserIcon}
            label="Role"
            value={user.role?.roleName || user.role || "—"}
          />
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900">Danger zone</h2>
            <p className="mt-1 text-sm text-gray-500">
              Once deleted, your account and all its data cannot be recovered.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-100 p-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Delete this account
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Permanently remove your profile, properties, and all data.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Delete account
          </button>
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

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </p>
        <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}