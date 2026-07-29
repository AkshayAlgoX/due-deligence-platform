'use client';

import React, { useEffect, useState } from 'react';
import { Building2, ShieldCheck, Clock } from 'lucide-react';
import api from '@/services/api';
import { API_ROUTES } from '@/constants/apiRoutes';

export default function RecentPropertiesTable() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const { data } = await api.get(API_ROUTES.PROPERTIES_RECENT);
        setProperties(data || []);
      } catch (err) {
        console.error("Failed to load recent properties", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
        <div className="border-b border-gray-100 dark:border-[#30363d] p-6">
          <div className="h-5 w-40 animate-pulse rounded bg-gray-100 dark:bg-[#1c2128]" />
          <div className="mt-2 h-3 w-56 animate-pulse rounded bg-gray-100 dark:bg-[#1c2128]" />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-[#30363d]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-6">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-100 dark:bg-[#1c2128]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-[#1c2128]" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-gray-100 dark:bg-[#1c2128]" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100 dark:bg-[#1c2128]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] p-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-[#1c2128]">
          <Building2 className="h-6 w-6 text-gray-300 dark:text-[#6e7681]" />
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3]">Couldn't load properties</p>
        <p className="mt-1 text-xs text-gray-500 dark:text-[#7d8590]">Please refresh the page to try again.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#30363d] p-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#e6edf3]">Recent properties</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#7d8590]">Latest additions to the platform</p>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-[#1c2128]">
            <Building2 className="h-6 w-6 text-gray-400 dark:text-[#6e7681]" />
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-[#e6edf3]">No properties found</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#7d8590]">Add a property to see it here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-[#1c2128] text-xs text-gray-500 dark:text-[#7d8590]">
              <tr>
                <th className="px-6 py-4 font-medium">Address</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Missing fields</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#30363d]">
              {properties.map((prop) => (
                <tr key={prop.id} className="transition-colors duration-150 hover:bg-gray-50/40 dark:hover:bg-[#1c2128]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 dark:bg-[#0d2818] text-[#22C55E] dark:text-green-400">
                        <Building2 size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-[#e6edf3]">{prop.address}</p>
                        <p className="text-xs text-gray-500 dark:text-[#7d8590]">
                          {prop.city}
                          {prop.state ? `, ${prop.state}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize text-gray-600 dark:text-[#7d8590]">
                    {prop.propertyType ? prop.propertyType.replace(/_/g, ' ').toLowerCase() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {prop.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-[#0d2818] px-2.5 py-1 text-xs font-semibold text-green-700 dark:text-green-400">
                        <ShieldCheck size={12} />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-[#282a10] px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        <Clock size={12} />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-[#7d8590]">
                    {prop.missingFields?.length > 0
                      ? `${prop.missingFields.length} missing`
                      : 'None'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}