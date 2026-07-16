"use client";

/**
 * PasswordInput — password field with show/hide toggle.
 * Accepts optional password-strength bar rendered below the input.
 */
import { useState } from "react";

// Simple inline SVG icons — no extra icon library needed
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function PasswordInput({
  id,
  label,
  placeholder = "••••••••",
  value,
  onChange,
  error = "",
  autoComplete,
  disabled = false,
  required = false,
  strengthBar = null, // Pass { label, color, width } from getPasswordStrength()
  className = "",
}) {
  const [show, setShow] = useState(false);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Lock icon */}
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
          <LockIcon />
        </span>

        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            w-full rounded-lg border pl-9 pr-10 py-2.5 text-sm text-gray-800
            placeholder-gray-400 bg-white transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error
              ? "border-red-400 focus:ring-red-400"
              : "border-gray-200 hover:border-gray-300"
            }
          `}
        />

        {/* Show / hide toggle */}
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {/* Password strength bar */}
      {strengthBar && value && (
        <div className="mt-1">
          <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${strengthBar.color} ${strengthBar.width}`}
            />
          </div>
          <p className={`text-xs mt-0.5 font-medium ${
            strengthBar.label === "Weak"   ? "text-red-500"    :
            strengthBar.label === "Fair"   ? "text-yellow-500" :
            strengthBar.label === "Good"   ? "text-blue-500"   :
            "text-green-600"
          }`}>
            {strengthBar.label} password
          </p>
        </div>
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-500 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
