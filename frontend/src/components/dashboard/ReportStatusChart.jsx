'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Completed', value: 50, color: '#22c55e' },
  { name: 'In Progress', value: 25, color: '#facc15' },
  { name: 'Pending', value: 25, color: '#3b82f6' },
];

export default function ReportStatusChart() {
  return (
    <Card className="p-6 rounded-2xl shadow-sm border border-gray-100 bg-white h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Report Status</h3>
        <p className="text-sm text-gray-500">Overall completion for active cycles</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] relative">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Custom Legend to match design (dots at bottom) */}
        <div className="flex gap-4 mt-2">
          {data.map((entry, index) => (
            <div key={index} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          ))}
        </div>
      </div>
    </Card>
  );
}
