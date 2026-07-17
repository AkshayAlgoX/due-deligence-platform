'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

const tasks = [
  { id: 1, name: 'Grand Central Plaza', location: 'New York', status: 'Verified', statusColor: 'green', risk: 'Low', riskColor: 'green', updated: 'Oct 24, 2023' },
  { id: 2, name: 'Oakwood Heights II', location: 'Chicago', status: 'Pending', statusColor: 'yellow', risk: 'Medium', riskColor: 'yellow', updated: 'Oct 23, 2023' },
  { id: 3, name: 'Riverfront Commons', location: 'Austin', status: 'Action Required', statusColor: 'blue', risk: 'High', riskColor: 'red', updated: 'Oct 23, 2023' },
  { id: 4, name: 'Tech Park 4', location: 'San Jose', status: 'In Progress', statusColor: 'blue', risk: 'Low', riskColor: 'green', updated: 'Oct 22, 2023' },
  { id: 5, name: 'Sunset View Villas', location: 'Miami', status: 'Verified', statusColor: 'green', risk: 'Low', riskColor: 'green', updated: 'Oct 21, 2023' },
];

export default function TasksTable() {
  return (
    <Card className="rounded-2xl shadow-sm border border-gray-100 bg-white overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-6 flex justify-between items-center border-b border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Recent Due Diligence Tasks</h3>
          <p className="text-sm text-gray-500">Ongoing property verifications and audit statuses</p>
        </div>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
          View Audit Log
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 font-medium">Property Name</th>
              <th className="px-6 py-4 font-medium">Location</th>
              <th className="px-6 py-4 font-medium">Verification Status</th>
              <th className="px-6 py-4 font-medium">Risk Profile</th>
              <th className="px-6 py-4 font-medium">Last Updated</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                      <Building2 size={16} />
                    </div>
                    <span className="font-semibold text-gray-900">{task.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{task.location}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      task.statusColor === 'green' ? 'bg-green-500' :
                      task.statusColor === 'yellow' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-gray-700">{task.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    task.riskColor === 'green' ? 'bg-green-100 text-green-700' :
                    task.riskColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {task.risk}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{task.updated}</td>
                <td className="px-6 py-4 text-right">
                  {/* Action empty for now, could be an icon or dots */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
