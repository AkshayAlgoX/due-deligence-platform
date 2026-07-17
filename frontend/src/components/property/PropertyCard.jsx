'use client';

import React from 'react';
import { MapPin, Home, DollarSign, Maximize, ChevronRight } from 'lucide-react';
import Card from '../common/Card';

export default function PropertyCard({ property, isSelected, onSelect }) {
  // ── Guard clause: don't render if data is missing ────────────────────────
  if (!property) return null;

  // ── Safe fallbacks for all fields ────────────────────────────────────────
  const address       = property.address       || 'Unknown Address';
  const city          = property.city          || '';
  const state         = property.state         || '';
  const zipCode       = property.zipCode       || '';
  const marketValue   = property.marketValue;
  const area          = property.area;
  const propertyType  = property.propertyType;

  // Build the location line only from present values
  const locationParts = [city, state, zipCode].filter(Boolean);
  const locationLine  = locationParts.join(', ').replace(', ' + zipCode, ' ' + zipCode);

  return (
    <div
      onClick={() => onSelect?.(property)}
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-[#22C55E]' : ''
      }`}
    >
      <Card className={`p-4 ${isSelected ? 'border-[#22C55E]' : 'border-gray-200'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">

            <div className="flex items-start space-x-2">
              <Home className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 line-clamp-1">
                  {address}
                </h3>
                {locationLine && (
                  <p className="text-sm text-gray-500 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {locationLine}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                <span>
                  {marketValue != null
                    ? `$${marketValue.toLocaleString()}`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Maximize className="h-3 w-3 mr-1 text-[#22C55E]" />
                <span>{area || 'N/A'} sqft</span>
              </div>
            </div>

            {propertyType && (
              <span className="mt-2 inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {propertyType}
              </span>
            )}

          </div>

          <ChevronRight
            className={`h-5 w-5 flex-shrink-0 transition ${
              isSelected ? 'text-[#22C55E]' : 'text-gray-300'
            }`}
          />
        </div>
      </Card>
    </div>
  );
}