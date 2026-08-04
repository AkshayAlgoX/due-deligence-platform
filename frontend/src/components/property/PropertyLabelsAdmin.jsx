"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Plus,
  X,
  Loader2,
  Tag,            // ← ADD this
  Info,
  Trash2,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropertyLabel from "./PropertyLabel";
import { LABEL_CONFIG, MANUAL_LABELS } from "@/constants/labels";
import { usePropertyLabels } from "@/hooks/usePropertyLabels";

const EXPIRY_PRESETS = [
  { value: 7, key: "7days" },
  { value: 30, key: "30days" },
  { value: 60, key: "60days" },
  { value: 90, key: "90days" },
  { value: null, key: "forever" },
];

export default function PropertyLabelsAdmin({ propertyId }) {
  const { t } = useTranslation();
  const { labels, loading, addLabel, removeLabel } =
    usePropertyLabels(propertyId);

  const [selectedType, setSelectedType] = useState(null);
  const [selectedExpiry, setSelectedExpiry] = useState(30);
  const [saving, setSaving] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

  const handleAdd = async () => {
    if (!selectedType) {
      toast.error(t("labels.admin.selectFirst", "Please select a label first"));
      return;
    }
    setSaving(true);
    try {
      await addLabel(selectedType, selectedExpiry);
      toast.success(t("labels.admin.added"));
      setSelectedType(null);
      setSelectedExpiry(30);
    } catch (e) {
      toast.error(e?.message || t("labels.admin.addError"));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (labelId) => {
    try {
      await removeLabel(labelId);
      toast.success(t("labels.admin.removed"));
      setConfirmRemoveId(null);
    } catch (e) {
      toast.error(e?.message || t("labels.admin.removeError"));
    }
  };

  const availableLabels = MANUAL_LABELS.filter(
    (type) => !labels.some((l) => l.type === type)
  );

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

      <div className="p-6 space-y-6">
        {/* ═══════════════ CURRENT LABELS ═══════════════ */}
        <div>
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
                  "Add a label below to make this property stand out"
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
                    className="relative group"
                  >
                    <PropertyLabel type={label.type} size="md" />

                    {/* Remove button */}
                    {confirmRemoveId === label.id ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-2 -right-2 flex items-center gap-1 bg-red-500 rounded-full px-1 py-0.5 shadow-lg"
                      >
                        <button
                          onClick={() => handleRemove(label.id)}
                          className="p-1 hover:bg-red-600 rounded-full transition-colors"
                          title={t("labels.admin.confirm", "Confirm")}
                        >
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        </button>
                        <button
                          onClick={() => setConfirmRemoveId(null)}
                          className="p-1 hover:bg-red-600 rounded-full transition-colors"
                          title={t("labels.admin.cancel", "Cancel")}
                        >
                          <X className="h-3 w-3 text-white" strokeWidth={3} />
                        </button>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setConfirmRemoveId(label.id)}
                        className="
                          absolute -top-1.5 -right-1.5 p-1 rounded-full
                          bg-red-500 text-white shadow-md
                          opacity-0 group-hover:opacity-100 transition-all
                          hover:bg-red-600 hover:scale-110
                        "
                        title={t("labels.admin.remove", "Remove")}
                      >
                        <Trash2 className="h-3 w-3" strokeWidth={2.5} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ═══════════════ DIVIDER ═══════════════ */}
        {availableLabels.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-[#30363d]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white dark:bg-[#161b22] text-xs font-medium text-gray-500 dark:text-[#7d8590] uppercase tracking-wider">
                {t("labels.admin.addNew", "Add New Label")}
              </span>
            </div>
          </div>
        )}

        {/* ═══════════════ LABEL PICKER (VISUAL CARDS) ═══════════════ */}
        {availableLabels.length > 0 ? (
          <>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-[#7d8590] uppercase tracking-wider mb-3">
                {t("labels.admin.selectType", "Choose Label")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {availableLabels.map((type) => {
                  const config = LABEL_CONFIG[type];
                  const Icon = config?.icon;
                  const isSelected = selectedType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all text-left
                        ${
                          isSelected
                            ? "border-green-500 bg-green-50 dark:bg-green-500/10 shadow-md scale-[1.02]"
                            : "border-gray-200 dark:border-[#30363d] hover:border-gray-300 dark:hover:border-[#484f58] hover:bg-gray-50 dark:hover:bg-[#0d1117]"
                        }
                      `}
                    >
                      {/* Selected checkmark */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center"
                        >
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        </motion.div>
                      )}

                      {/* Label preview */}
                      <div className="mb-3">
                        <PropertyLabel type={type} size="md" />
                      </div>

                      {/* Description */}
                      <p className="text-xs text-gray-600 dark:text-[#7d8590] leading-relaxed">
                        {t(
                          `labels.admin.description.${type}`,
                          type === "FEATURED"
                            ? "Highlight as sponsored listing"
                            : type === "PREMIUM"
                            ? "Top-tier luxury property"
                            : type === "UNDER_OFFER"
                            ? "Buyer negotiation in progress"
                            : ""
                        )}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ═══════════════ EXPIRY PRESETS ═══════════════ */}
            {selectedType && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs font-bold text-gray-500 dark:text-[#7d8590] uppercase tracking-wider">
                    {t("labels.admin.duration", "Duration")}
                  </p>
                  <div
                    className="group relative"
                    title={t(
                      "labels.admin.durationHint",
                      "Label automatically disappears after this period"
                    )}
                  >
                    <Info className="h-3 w-3 text-gray-400 dark:text-[#6e7681] cursor-help" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {EXPIRY_PRESETS.map((preset) => {
                    const isSelected = selectedExpiry === preset.value;
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => setSelectedExpiry(preset.value)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-semibold transition-all
                          ${
                            isSelected
                              ? "bg-green-500 text-white shadow-md scale-105"
                              : "bg-gray-100 dark:bg-[#0d1117] text-gray-700 dark:text-[#e6edf3] hover:bg-gray-200 dark:hover:bg-[#1c2128] border border-transparent hover:border-gray-300 dark:hover:border-[#30363d]"
                          }
                        `}
                      >
                        {t(
                          `labels.admin.expiry.${preset.key}`,
                          preset.key === "forever"
                            ? "♾ Forever"
                            : `${preset.value} days`
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ═══════════════ ADD BUTTON ═══════════════ */}
            <motion.button
              onClick={handleAdd}
              disabled={!selectedType || saving}
              whileHover={selectedType ? { scale: 1.01 } : {}}
              whileTap={selectedType ? { scale: 0.99 } : {}}
              className={`
                w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                font-bold text-sm transition-all
                ${
                  selectedType && !saving
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/30"
                    : "bg-gray-100 dark:bg-[#0d1117] text-gray-400 dark:text-[#6e7681] cursor-not-allowed"
                }
              `}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("labels.admin.adding", "Adding...")}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" strokeWidth={3} />
                  {selectedType
                    ? t("labels.admin.addButton", "Add Label")
                    : t("labels.admin.selectFirst", "Select a label first")}
                </>
              )}
            </motion.button>
          </>
        ) : (
          <div className="text-center py-6 rounded-xl bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d]">
            <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700 dark:text-[#e6edf3]">
              {t("labels.admin.allApplied", "All labels applied!")}
            </p>
            <p className="text-xs text-gray-500 dark:text-[#7d8590] mt-1">
              {t(
                "labels.admin.allAppliedHint",
                "Remove one above to add a different label"
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}