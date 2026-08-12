"use client";

import { useState } from "react";
import { Calendar, Check } from "lucide-react";

const PRESETS = [
  { label: "Today", value: "today" },
  { label: "7d",    value: "7d" },
  { label: "30d",   value: "30d" },
  { label: "90d",   value: "90d" },
];

export default function DateRangePicker({ value, onChange }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const handlePreset = (preset) => {
    setShowCustom(false);
    onChange(preset);
  };

  const handleCustomApply = () => {
    if (!customFrom || !customTo) return;
    onChange({ from: customFrom, to: customTo });
  };

  const isPresetActive = (preset) => !showCustom && value === preset;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset segment control */}
      <div className="inline-flex items-center gap-0.5 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-1">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePreset(p.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isPresetActive(p.value)
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1c2128]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom trigger */}
      <button
        onClick={() => setShowCustom((s) => !s)}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
          showCustom
            ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
            : "border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-gray-700 dark:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#1c2128]"
        }`}
      >
        <Calendar size={13} />
        Custom
      </button>

      {/* Custom pickers */}
      {showCustom && (
        <div className="flex items-center gap-2 ml-1 flex-wrap">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-sm text-gray-900 dark:text-[#e6edf3] px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 [color-scheme:light] dark:[color-scheme:dark]"
          />
          <span className="text-xs text-gray-400 dark:text-[#7d8590]">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-sm text-gray-900 dark:text-[#e6edf3] px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 [color-scheme:light] dark:[color-scheme:dark]"
          />
          <button
            onClick={handleCustomApply}
            disabled={!customFrom || !customTo}
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-500/30 transition-all"
          >
            <Check size={13} />
            Apply
          </button>
        </div>
      )}
    </div>
  );
}