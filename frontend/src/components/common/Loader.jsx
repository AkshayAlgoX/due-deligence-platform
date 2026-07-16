"use client";

/**
 * Loader — full-screen centred spinner overlay.
 */
export default function Loader({ message = "Loading…" }) {
  return (
    <div
      role="status"
      aria-label={message}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm"
    >
      <svg
        className="animate-spin h-10 w-10 text-green-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p className="mt-3 text-sm text-gray-600 font-medium">{message}</p>
    </div>
  );
}
