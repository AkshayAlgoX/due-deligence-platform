"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  ShieldOff,
  MonitorSmartphone,
} from "lucide-react";

import DeleteAccountModal from "@/components/profile/DeleteAccountModal";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import SignOutAllModal from "@/components/profile/SignOutAllModal";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import { getCurrentUser, updateProfile } from "@/services/authService";
import AvatarUploader from "@/components/profile/AvatarUploader";

export default function ProfilePage() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t("profile.pageTitle");
  }, [t]);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [signOutAllOpen, setSignOutAllOpen] = useState(false);

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
        toast.error(t("profile.errors.couldntLoad"), {
          description: err?.message || t("profile.errors.pleaseRefresh"),
        });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [t]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 text-center">
        <p className="text-sm text-gray-500 dark:text-[#7d8590]">
          {t("profile.errors.unableToLoad")}
        </p>
      </div>
    );
  }

  // ── Translated provider / role labels ───────────────────────────────
  const providerLabel = user.authProvider
    ? t(`profile.authProvider.${user.authProvider}`, { defaultValue: "—" })
    : "—";

  const roleLabel = user.role
    ? t(`profile.roles.${user.role}`, { defaultValue: "—" })
    : "—";

  const roleTagline = user.role
    ? t(`profile.roleTaglines.${user.role}`, { defaultValue: "" })
    : "";

  // ── Member since — localized month + year using active locale ──────
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(i18n.language || "en", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const isGoogleOnly = user.authProvider === "GOOGLE";
  const isVerified = user.email && user.email.includes("@");
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
      toast.success(t("profile.success.profileUpdated"), {
        description: t("profile.success.changesSaved"),
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("property.search.tryAgain");
      toast.error(t("profile.errors.updateFailed"), { description: msg });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* ── Page title ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900 dark:text-[#e6edf3]">
          {t("profile.title")}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-[#7d8590]">
          {t("profile.subtitle")}
        </p>
      </div>

      {/* ── HERO BANNER CARD ───────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
            }}
          />
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#22C55E]/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <div className="px-8 pb-6">
          <div className="flex justify-start -mt-16">
            <AvatarUploader
              user={user}
              size={128}
              onUpdated={(updated) => setUser(updated)}
            />
          </div>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black text-gray-900 dark:text-[#e6edf3] tracking-tight">
                  {user.fullName || t("profile.fallbackUser")}
                </h2>
                {isVerified && (
                  <div className="flex items-center gap-1 rounded-full bg-green-50 dark:bg-[#0d2818] px-2.5 py-1 ring-1 ring-green-200 dark:ring-green-900">
                    <BadgeCheck
                      className="h-3.5 w-3.5 text-green-600 dark:text-green-400"
                      strokeWidth={2.5}
                    />
                    <span className="text-[10px] font-black text-green-700 dark:text-green-400">
                      {t("profile.verified", { role: roleLabel })}
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-500 dark:text-[#7d8590] font-medium">
                <Briefcase
                  className="h-3.5 w-3.5 text-gray-400 dark:text-[#6e7681]"
                  strokeWidth={2}
                />
                {roleTagline || user.email}
              </p>
            </div>

            <div className="flex-shrink-0">
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-[#e6edf3] transition hover:border-[#22C55E] hover:text-[#16a34a] dark:hover:text-[#22C55E] cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={2.4} />
                  {t("profile.actions.editProfile")}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-[#e6edf3] transition hover:bg-gray-50 dark:hover:bg-[#161b22] disabled:opacity-50 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.4} />
                    {t("profile.actions.cancel")}
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
                    {saving
                      ? t("profile.actions.saving")
                      : t("profile.actions.saveChanges")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── ACCOUNT DETAILS ────────────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
            {t("profile.sections.accountDetails")}
          </h2>
          <p className="mt-1 text-xs text-gray-400 dark:text-[#6e7681]">
            {t("profile.sections.accountDetailsSubtitle")}
          </p>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-[#30363d] rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
          {editing ? (
            <EditRow
              icon={UserIcon}
              label={t("profile.fields.fullName")}
              value={fullName}
              onChange={setFullName}
              placeholder={t("profile.placeholders.fullName")}
              error={
                fullName && !nameValid
                  ? t("profile.errors.nameValidation")
                  : null
              }
            />
          ) : (
            <InfoRow
              icon={UserIcon}
              label={t("profile.fields.fullName")}
              value={user.fullName || "—"}
            />
          )}

          <InfoRow
            icon={Mail}
            label={t("profile.fields.email")}
            value={user.email}
            locked
            lockedLabel={t("profile.locked")}
          />

          {editing ? (
            <EditRow
              icon={Phone}
              label={t("profile.fields.phone")}
              value={phoneNumber}
              onChange={(v) => onChangePhone(v, setPhoneNumber)}
              placeholder={t("profile.placeholders.phone")}
              prefix="+91"
              error={
                phoneNumber && !phoneValid
                  ? t("profile.errors.phoneValidation")
                  : null
              }
            />
          ) : (
            <InfoRow
              icon={Phone}
              label={t("profile.fields.phone")}
              value={user.phoneNumber ? `+91 ${user.phoneNumber}` : "—"}
            />
          )}

          <InfoRow
            icon={Shield}
            label={t("profile.fields.signInMethod")}
            value={providerLabel}
            locked
            lockedLabel={t("profile.locked")}
          />
          <InfoRow
            icon={UserIcon}
            label={t("profile.fields.accessLevel")}
            value={roleLabel}
            locked
            lockedLabel={t("profile.locked")}
          />
          <InfoRow
            icon={Calendar}
            label={t("profile.fields.memberSince")}
            value={memberSince}
            locked
            lockedLabel={t("profile.locked")}
          />
        </div>
      </section>

      {/* ── SECURITY & ACCESS ──────────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-[#7d8590]">
            {t("profile.sections.security")}
          </h2>
          <p className="mt-1 text-xs text-gray-400 dark:text-[#6e7681]">
            {t("profile.sections.securitySubtitle")}
          </p>
        </div>

        <div className="space-y-3">
          {/* Change password card */}
          <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#edf7f3] dark:bg-[#0d2818] ring-1 ring-green-100 dark:ring-green-900">
                  <Lock
                    className="h-4 w-4 text-[#16a34a] dark:text-green-400"
                    strokeWidth={2.2}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 dark:text-[#e6edf3]">
                    {t("profile.password.title")}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590]">
                    {isGoogleOnly
                      ? t("profile.password.googleOnly")
                      : t("profile.password.description")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordOpen(true)}
                disabled={isGoogleOnly}
                className="flex-shrink-0 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#1c2128] px-4 py-2 text-xs font-bold text-gray-700 dark:text-[#e6edf3] transition hover:border-[#22C55E] hover:text-[#16a34a] dark:hover:text-[#22C55E] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {t("profile.actions.changePassword")}
              </button>
            </div>
          </div>

          {/* Sign out everywhere card */}
          <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-[#282a10] ring-1 ring-orange-100 dark:ring-orange-900">
                  <MonitorSmartphone
                    className="h-4 w-4 text-orange-600 dark:text-orange-400"
                    strokeWidth={2.2}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 dark:text-[#e6edf3]">
                    {t("profile.signOutAll.title")}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590] leading-relaxed">
                    {t("profile.signOutAll.description")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSignOutAllOpen(true)}
                className="flex-shrink-0 flex items-center gap-1.5 rounded-xl border border-orange-200 dark:border-orange-900 bg-white dark:bg-[#1c2128] px-4 py-2 text-xs font-bold text-orange-700 dark:text-orange-400 transition hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-[#282a10] cursor-pointer"
              >
                <ShieldOff className="h-3.5 w-3.5" strokeWidth={2.4} />
                {t("profile.signOutAll.button")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── DANGER ZONE ────────────────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
            {t("profile.sections.dangerZone")}
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590]">
            {t("profile.sections.dangerZoneSubtitle")}
          </p>
        </div>

        <div className="rounded-2xl border-2 border-red-100 dark:border-red-950 bg-red-50/30 dark:bg-[#2d1214]/40 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-[#2d1214] ring-1 ring-red-200 dark:ring-red-900">
              <AlertTriangle
                className="h-4 w-4 text-red-600 dark:text-red-400"
                strokeWidth={2.2}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gray-900 dark:text-[#e6edf3]">
                {t("profile.delete.title")}
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-[#7d8590] leading-relaxed">
                {t("profile.delete.description")}
              </p>

              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="mt-4 rounded-xl border border-red-300 dark:border-red-900 bg-white dark:bg-[#1c2128] px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 shadow-sm transition hover:border-red-600 hover:bg-red-600 hover:text-white dark:hover:bg-red-900 dark:hover:text-white cursor-pointer"
              >
                {t("profile.actions.deleteAccount")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modals — will be wrapped in a later batch */}
      <DeleteAccountModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        user={user}
      />
      <ChangePasswordModal
        isOpen={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
      <SignOutAllModal
        isOpen={signOutAllOpen}
        onClose={() => setSignOutAllOpen(false)}
      />
    </div>
  );
}

// ── Phone digit sanitizer (unchanged behavior) ────────────────────────
function onChangePhone(v, setter) {
  setter(v.replace(/\D/g, "").slice(0, 10));
}

// ── Sub-components ────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value, locked = false, lockedLabel }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-[#1c2128] text-gray-500 dark:text-[#7d8590] ring-1 ring-gray-100 dark:ring-[#30363d]">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-[#7d8590]">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-bold text-gray-900 dark:text-[#e6edf3] truncate">
          {value}
        </p>
      </div>
      {locked && (
        <span className="flex-shrink-0 rounded-md bg-gray-100 dark:bg-[#1c2128] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#7d8590]">
          {lockedLabel}
        </span>
      )}
    </div>
  );
}

function EditRow({ icon: Icon, label, value, onChange, placeholder, prefix, error }) {
  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#edf7f3] dark:bg-[#0d2818] text-[#16a34a] dark:text-green-400 ring-1 ring-green-100 dark:ring-green-900">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-[#7d8590]">
          {label}
        </label>
        <div className="mt-1 flex items-center gap-2">
          {prefix && (
            <span className="text-sm font-bold text-gray-500 dark:text-[#7d8590]">
              {prefix}
            </span>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-md border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-[#e6edf3] focus:border-[#22C55E] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20"
          />
        </div>
        {error && (
          <p className="mt-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}