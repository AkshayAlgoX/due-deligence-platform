"use client";

import { useTranslation } from "react-i18next";
import { Loader2, CheckCircle2, AlertCircle, FileText, FileSpreadsheet, Archive } from "lucide-react";
import { EXPORT_FORMATS, EXPORT_STAGES } from "@/utils/exportConstants";

export default function ExportProgressModal({
  isOpen,
  stage = EXPORT_STAGES.IDLE,
  percent = 0,
  format = EXPORT_FORMATS.PDF,
  onClose,
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const isCompleted = stage === EXPORT_STAGES.COMPLETED;
  const isFailed = stage === EXPORT_STAGES.FAILED;

  const getFormatIcon = () => {
    switch (format) {
      case EXPORT_FORMATS.EXCEL:
        return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
      case EXPORT_FORMATS.ZIP:
        return <Archive className="w-8 h-8 text-amber-500" />;
      case EXPORT_FORMATS.PDF:
      default:
        return <FileText className="w-8 h-8 text-sky-500" />;
    }
  };

  const getStageMessage = () => {
    switch (stage) {
      case EXPORT_STAGES.PREPARING:
        return t("export.progress.preparing", "Preparing document layout & sections...");
      case EXPORT_STAGES.FETCHING:
        return t("export.progress.fetching", "Fetching report risk data...");
      case EXPORT_STAGES.GENERATING:
        return t("export.progress.rendering", "Rendering graphics, tables & cover page...");
      case EXPORT_STAGES.DOWNLOADING:
        return t("export.progress.finalizing", "Finalizing binary stream & starting download...");
      case EXPORT_STAGES.COMPLETED:
        return t("export.ready.message", "Export completed successfully!");
      case EXPORT_STAGES.FAILED:
        return t("export.error.failed", "Failed to generate export file.");
      default:
        return t("export.generating", "Generating export file...");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#161b22] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-5 flex items-center justify-center">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 shadow-inner">
              {getFormatIcon()}
            </div>
            {!isCompleted && !isFailed && (
              <div className="absolute -bottom-1 -right-1 bg-sky-500 rounded-full p-1 text-white shadow-md">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
            {isCompleted && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 text-white shadow-md">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            {isFailed && (
              <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 text-white shadow-md">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {isCompleted
              ? t("export.ready.title", "Export Ready")
              : isFailed
              ? t("export.error.title", "Export Error")
              : t("export.generating", "Generating Export")}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 mb-6 min-h-[40px]">
            {getStageMessage()}
          </p>

          <div className="w-full mb-4">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {t("export.progress.label", "Progress")}
              </span>
              <span className="text-sky-600 dark:text-sky-400">
                {Math.round(percent)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isFailed
                    ? "bg-red-500"
                    : isCompleted
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-sky-500 to-blue-600"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
              />
            </div>
          </div>

          {(isCompleted || isFailed) && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full py-2.5 px-4 rounded-xl font-medium text-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
            >
              {t("common.close", "Close")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
