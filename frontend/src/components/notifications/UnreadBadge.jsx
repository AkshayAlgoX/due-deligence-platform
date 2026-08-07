"use client";

/**
 * UnreadBadge — the red dot/count shown on the notification bell.
 *
 * Shows:
 *  - Nothing when count is 0
 *  - A number (capped at 99+) when count > 0
 */
export default function UnreadBadge({ count, size = "default" }) {
  if (!count || count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);
  const isSmall = size === "small";

  return (
    <span
      aria-label={`${count} unread notifications`}
      className={`
        absolute flex items-center justify-center
        rounded-full bg-red-500 text-white font-bold
        leading-none select-none pointer-events-none
        ${isSmall
          ? "top-0.5 right-0.5 w-4 h-4 text-[9px]"
          : "top-1 right-1 min-w-[18px] h-[18px] px-1 text-[10px]"
        }
      `}
    >
      {label}
    </span>
  );
}
