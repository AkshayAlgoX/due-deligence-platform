"use client";

/**
 * Input — reusable labelled text input.
 * Renders an optional left icon, the input itself, and an inline error message.
 */

export default function Input({
  id,
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error = "",
  icon: Icon,
  autoComplete,
  disabled = false,
  required = false,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Icon size={16} />
          </span>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800
            placeholder-gray-400 bg-white transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${Icon ? "pl-9" : "pl-3"}
            ${error
              ? "border-red-400 focus:ring-red-400"
              : "border-gray-200 hover:border-gray-300"
            }
          `}
        />
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-500 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
