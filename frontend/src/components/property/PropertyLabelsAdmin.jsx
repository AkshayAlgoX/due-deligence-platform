"use client";

import { useTranslation } from "react-i18next";
import { Loader2, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropertyLabel from "./PropertyLabel";
import { usePropertyLabels } from "@/hooks/usePropertyLabels";

export default function PropertyLabelsAdmin({ propertyId }) {
  const { t } = useTranslation();
  const { labels, loading } = usePropertyLabels(propertyId);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] overflow-hidden">
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-[#30363d] bg-gradient-to-r from-green-50 to-transparent dark:from-green-950/20 dark:to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/10 dark:bg-green-500/20">
              <Tag className="h-5 w-5 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">
                {t("labels.admin.title", "Property Labels")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-[#7d8590] mt-0.5">
                {t(
                  "labels.admin.subtitle",
                  "Marketing badges to attract more buyers"
                )}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#0d1117] text-xs font-medium text-gray-600 dark:text-[#7d8590]">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            {t("labels.admin.adminOnly", "Admin only")}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* ═══════════════ CURRENT LABELS ═══════════════ */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-gray-500 dark:text-[#7d8590] uppercase tracking-wider">
            {t("labels.admin.current", "Active Labels")}
          </h4>
          {labels.length > 0 && (
            <span className="text-xs font-semibold text-gray-500 dark:text-[#7d8590] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#0d1117]">
              {labels.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-gray-500 dark:text-[#7d8590]">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {t("labels.admin.loading", "Loading...")}
          </div>
        ) : labels.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-[#30363d] rounded-xl">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-[#0d1117] flex items-center justify-center mb-3">
              <Tag className="h-5 w-5 text-gray-400 dark:text-[#6e7681]" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-[#7d8590]">
              {t("labels.admin.empty", "No labels applied yet")}
            </p>
            <p className="text-xs text-gray-400 dark:text-[#6e7681] mt-1">
              {t(
                "labels.admin.emptyHint",
                "Labels are applied automatically by the system"
              )}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            <AnimatePresence mode="popLayout">
              {labels.map((label) => (
                <motion.div
                  key={label.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                >
                  <PropertyLabel type={label.type} size="md" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
