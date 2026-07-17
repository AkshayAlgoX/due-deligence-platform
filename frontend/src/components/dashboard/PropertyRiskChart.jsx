'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Maximize2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'Commercial', low: 45, medium: 25, high: 10 },
  { name: 'Residential', low: 60, medium: 15, high: 5 },
  { name: 'Industrial', low: 30, medium: 40, high: 15 },
  { name: 'Land', low: 20, medium: 35, high: 25 },
];

export default function PropertyRiskChart() {
  return (
    <Card className="p-6 rounded-2xl shadow-sm border border-gray-100 bg-white h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Property Risk Analysis</h3>
          <p className="text-sm text-gray-500">Risk distribution across asset categories</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition">
          <Maximize2 size={16} />
        </button>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
            barSize={20}
            barGap={2}
          >
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
            />
            <Tooltip
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} 
              formatter={(value) => <span className="text-gray-600">{value}</span>}
            />
            <Bar dataKey="low" name="Low Risk" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="medium" name="Medium Risk" fill="#facc15" radius={[4, 4, 0, 0]} />
            <Bar dataKey="high" name="High Risk" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
