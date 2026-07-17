'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ title, value, icon, trendValue, trendUp }) {
  return (
    <Card className="p-6 rounded-2xl shadow-sm border border-gray-100 bg-white flex flex-col justify-between gap-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shadow-sm">
          {icon}
        </div>
        
        {trendValue && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trendUp ? '+' : '-'}{trendValue}</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-gray-500 font-medium text-sm">{title}</p>
        <h3 className="text-3xl font-extrabold text-gray-900">{value}</h3>
      </div>
    </Card>
  );
}
