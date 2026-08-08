"use client";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

/**
 * Normalizes whatever shape the backend sends into a lookup:
 *   { "0-0": count, "0-1": count, ... } keyed by `${dayOfWeek}-${hour}`
 *
 * Handles two likely backend shapes:
 *   [{ dayOfWeek: 0, hour: 14, count: 5 }, ...]
 *   [{ day: 0, hour: 14, activity: 5 }, ...]
 */
function normalize(raw) {
  const map = {};
  if (!Array.isArray(raw)) return map;
  for (const entry of raw) {
    const day = entry.dayOfWeek ?? entry.day ?? 0;
    const hour = entry.hour ?? 0;
    const count = entry.count ?? entry.activity ?? entry.value ?? 0;
    map[`${day}-${hour}`] = count;
  }
  return map;
}

function intensityColor(count, max) {
  if (!count || max === 0) return "bg-gray-100 dark:bg-[#1c2128]";
  const ratio = count / max;
  if (ratio > 0.75) return "bg-green-600";
  if (ratio > 0.5) return "bg-green-500";
  if (ratio > 0.25) return "bg-green-400/70";
  return "bg-green-300/50";
}

export default function UserActivityHeatmap({ data }) {
  const map = normalize(data);
  const max = Math.max(0, ...Object.values(map));

  const hasAnyData = Object.values(map).some((v) => v > 0);

  if (!hasAnyData) {
    return (
      <p className="text-xs text-gray-400 dark:text-[#7d8590] py-10 text-center">
        No activity data yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex gap-[3px] mb-1 pl-8">
          {HOURS.filter((h) => h % 3 === 0).map((h) => (
            <span
              key={h}
              className="text-[9px] text-gray-400 dark:text-[#7d8590]"
              style={{ width: "3ch" }}
            >
              {h}
            </span>
          ))}
        </div>
        {DAYS.map((label, day) => (
          <div key={day} className="flex items-center gap-[3px] mb-[3px]">
            <span className="w-8 text-[10px] text-gray-400 dark:text-[#7d8590]">{label}</span>
            {HOURS.map((hour) => {
              const count = map[`${day}-${hour}`] ?? 0;
              return (
                <div
                  key={hour}
                  title={`${label} ${hour}:00 — ${count} events`}
                  className={`h-3 w-3 rounded-sm ${intensityColor(count, max)}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}