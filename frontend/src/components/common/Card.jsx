"use client";

/**
 * Card — generic white rounded card with soft shadow.
 */
export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}
