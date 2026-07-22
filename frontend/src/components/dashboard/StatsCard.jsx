'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, subtitle, icon, trendValue, trendUp }) {
  // Anti-AI Rule #2: One accent color (Green). Replaced blue.
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors duration-200 hover:border-gray-200 flex flex-col justify-between gap-6">
      <div className="flex items-start justify-between">
       <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#22C55E] transition-transform duration-200 group-hover:scale-110">
          {icon}
        </div>
        
        {trendValue !== null && trendValue !== "0" && trendValue !== "0%" && (
          <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trendValue.startsWith('-') ? trendValue.substring(1) : trendValue}</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-3xl font-extrabold text-gray-900">{value}</h3>
        {subtitle && (
          <p className="text-xs text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}