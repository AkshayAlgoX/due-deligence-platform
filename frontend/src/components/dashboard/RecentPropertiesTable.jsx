'use client';

import React, { useEffect, useState } from 'react';
import { Building2, ShieldCheck, Clock, Loader2 } from 'lucide-react';
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
      <div className="flex h-48 items-center justify-center rounded-2xl border border-gray-100 bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
        <p className="text-sm text-gray-500">Could not load recent properties.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 p-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Recent properties</h3>
          <p className="mt-1 text-sm text-gray-500">Latest additions to the platform</p>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
            <Building2 className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">No properties found</p>
          <p className="mt-1 text-sm text-gray-500">Add a property to see it here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-xs text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Address</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Missing fields</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.map((prop) => (
                <tr key={prop.id} className="transition hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-[#22C55E]">
                        <Building2 size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{prop.address}</p>
                        <p className="text-xs text-gray-500">
                          {prop.city}
                          {prop.state ? `, ${prop.state}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize text-gray-600">
                    {prop.propertyType ? prop.propertyType.replace(/_/g, ' ').toLowerCase() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {prop.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                        <ShieldCheck size={12} />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        <Clock size={12} />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
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