"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESETS = [
  { label: "Today", value: "today" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
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
      {PRESETS.map((p) => (
        <Button
          key={p.value}
          size="sm"
          variant={isPresetActive(p.value) ? "default" : "outline"}
          onClick={() => handlePreset(p.value)}
        >
          {p.label}
        </Button>
      ))}

      <Button
        size="sm"
        variant={showCustom ? "default" : "outline"}
        onClick={() => setShowCustom((s) => !s)}
      >
        Custom
      </Button>

      {showCustom && (
        <div className="flex items-center gap-2 ml-1">
          <Input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="w-36 bg-white text-gray-900 dark:bg-[#161b22] dark:text-[#e6edf3]"
          />
          <span className="text-xs text-gray-400 dark:text-[#7d8590]">to</span>
          <Input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="w-36 bg-white text-gray-900 dark:bg-[#161b22] dark:text-[#e6edf3]"
          />
          <Button size="sm" onClick={handleCustomApply} disabled={!customFrom || !customTo}>
            Apply
          </Button>
        </div>
      )}
    </div>
  );
}