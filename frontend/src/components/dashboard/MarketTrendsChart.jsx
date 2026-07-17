'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'Jan', value: 4200 },
  { name: 'Feb', value: 4400 },
  { name: 'Mar', value: 4450 },
  { name: 'Apr', value: 4350 },
  { name: 'May', value: 4600 },
  { name: 'Jun', value: 4800 },
  { name: 'Jul', value: 4950 },
];

export default function MarketTrendsChart() {
  return (
    <Card className="p-6 rounded-2xl shadow-sm border border-gray-100 bg-white hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Portfolio Market Trends</h3>
          <p className="text-sm text-gray-500">Value appreciation vs. overall risk index (6 months)</p>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-gray-600">Appreciation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-gray-600">Risk Trend</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#6b7280' }} 
              domain={[0, 6000]}
              ticks={[0, 1500, 3000, 4500, 6000]}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
