"use client";

import { useEffect, useState } from "react";
import { X, Mail, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getUserById } from "@/services/adminService";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function UserDetailModal({ userId, isOpen, onClose }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!isOpen || !userId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getUserById(userId);
        if (!cancelled) setDetail(data);
      } catch {
        if (!cancelled) {
          toast.error(t("nav.admin.userManagement.failedToLoad"));
          onClose();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isOpen, userId, t]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#161b22] shadow-2xl m-4 border border-gray-100 dark:border-[#30363d]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-[#30363d]">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
              {t("nav.admin.userDetail.title")}
            </h3>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-[#7d8590]">
              {t("nav.admin.userDetail.subtitle")}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-[#e6edf3] transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <>
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3]">
                  {detail?.fullName || "—"}
                </h4>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={detail?.isBanned ? "destructive" : detail?.isActive ? "default" : "secondary"}>
                    {detail?.isBanned
                      ? t("nav.admin.userManagement.banned")
                      : detail?.isActive
                        ? t("nav.admin.userManagement.active")
                        : t("nav.admin.userManagement.inactive")}
                  </Badge>
                  <Badge variant="outline">{detail?.role || "—"}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <DetailRow
                  icon={<Mail size={16} />}
                  label={t("nav.admin.userDetail.email")}
                  value={detail?.email || "—"}
                />
                <DetailRow
                  icon={<Calendar size={16} />}
                  label={t("nav.admin.userDetail.joined")}
                  value={formatDate(detail?.createdAt)}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-100 dark:border-[#30363d] px-6 py-4 bg-gray-50 dark:bg-[#0d1117] rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] px-4 py-2 text-sm font-bold text-gray-700 dark:text-[#e6edf3] transition hover:bg-gray-50 dark:hover:bg-[#1c2128]"
          >
            {t("nav.admin.userDetail.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 dark:bg-[#0d1117] px-3 py-2">
      <div className="flex items-center gap-2 text-gray-500 dark:text-[#7d8590]">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-medium text-gray-900 dark:text-[#e6edf3]">{value}</span>
    </div>
  );
}