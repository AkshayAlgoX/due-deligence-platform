"use client";

import React, { useState } from "react";
import { MapPin, Search, X, ArrowRight } from "lucide-react";

export default function SearchBar({ onSearch, initialValue = "" }) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">

      {/* Premium input with pin icon */}
      <div className="relative flex-1 group">
        <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-[#22C55E] transition-colors" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try: 742 Evergreen Terrace, Bangalore, London..."
          className="h-14 w-full rounded-2xl border-2 border-gray-100 bg-gray-50/50 pl-11 pr-11 text-sm font-medium outline-none transition-all focus:border-[#22C55E] focus:bg-white focus:shadow-[0_0_0_4px_rgba(34,197,94,0.1)]"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Premium green button — much more polished */}
      <button
        type="submit"
        className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16a34a] px-8 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(34,197,94,0.35)] transition-all hover:shadow-[0_15px_40px_rgba(34,197,94,0.5)] hover:scale-[1.02] active:scale-[0.98]"
      >
        {/* Shimmer effect */}
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

        <Search className="h-4 w-4 relative z-10" strokeWidth={2.5} />
        <span className="relative z-10">Search Properties</span>
        <ArrowRight className="h-4 w-4 relative z-10 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
      </button>

    </form>
  );
}