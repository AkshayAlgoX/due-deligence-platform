export default function Input({
  label,
  type = "text",
  placeholder = "",
  value = "",
  onChange,
  error = "",
  required = false,
  disabled = false,
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={`
          border
          rounded-lg
          px-3
          py-2
          outline-none
          focus:ring-2
          focus:ring-blue-500
          ${disabled ? "bg-gray-100" : ""}
        `}
      />

      {error && (
        <p className="text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}