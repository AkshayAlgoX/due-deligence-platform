'use client';

import React from 'react';

export default function PropertyTable({ properties, selectedProperty, onSelect }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Address</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">City</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Type</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">Area (sqft)</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-600">Market Value</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr
                key={property.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${
                  selectedProperty?.id === property.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onSelect(property)}
              >
                <td className="py-3 px-4 font-medium text-gray-800">{property.address}</td>
                <td className="py-3 px-4 text-gray-600">{property.city}</td>
                <td className="py-3 px-4 text-gray-600">{property.propertyType || 'N/A'}</td>
                <td className="py-3 px-4 text-right text-gray-600">{property.area || 'N/A'}</td>
                <td className="py-3 px-4 text-right font-medium text-green-700">
                  ${property.marketValue?.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(property);
                    }}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      selectedProperty?.id === property.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    } transition`}
                  >
                    {selectedProperty?.id === property.id ? 'Selected' : 'View'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}