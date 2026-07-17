"use client";

import React, { useState } from "react";
import { MapPin, Search, X } from "lucide-react";

export default function SearchBar({ onSearch, initialValue = "" }) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
    }
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">

      {/* Input with pin icon */}
      <div className="relative flex-1">
        <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="742 Evergreen Terrace, Springfield, OR 97477"
          className="h-14 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-11 text-sm outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-green-100 transition"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Green validate button */}
      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-8 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(34,197,94,0.3)] transition hover:bg-[#16a34a]"
      >
        <Search className="h-4 w-4" />
        Validate Address
      </button>

    </form>
  );
}