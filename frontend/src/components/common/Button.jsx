"use client";

/**
 * Button — primary action button with loading spinner support.
 */
export default function Button({
  type = "button",
  children,
  onClick,
  loading = false,
  disabled = false,
  variant = "primary",  // "primary" | "secondary" | "outline"
  fullWidth = false,
  className = "",
}) {
  const base = `
    inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5
    text-sm font-semibold transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed
    active:scale-[0.98]
    ${fullWidth ? "w-full" : ""}
  `;

  const variants = {
    primary:
      "bg-green-500 hover:bg-green-600 text-white shadow-sm shadow-green-200 focus:ring-green-400",
    secondary:
      "bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-500",
    outline:
      "border border-green-500 text-green-600 hover:bg-green-50 focus:ring-green-400",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
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
      )}
      {loading ? "Please wait…" : children}
    </button>
  );
}
