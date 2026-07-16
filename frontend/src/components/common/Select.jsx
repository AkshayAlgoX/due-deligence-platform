"use client";

/**
 * Select — reusable labelled dropdown.
 * Renders a native <select> with Tailwind styling to match the Input component.
 */
export default function Select({
  id,
  label,
  value,
  onChange,
  options = [],     // [{ label: string, value: string }]
  placeholder = "Select an option",
  error = "",
  disabled = false,
  required = false,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Chevron icon */}
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>

        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            w-full appearance-none rounded-lg border px-3 py-2.5 pr-9 text-sm bg-white
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${!value ? "text-gray-400" : "text-gray-800"}
            ${error
              ? "border-red-400 focus:ring-red-400"
              : "border-gray-200 hover:border-gray-300"
            }
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-500 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
