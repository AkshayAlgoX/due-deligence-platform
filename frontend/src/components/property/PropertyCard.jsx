'use client';

import React from 'react';
import { MapPin, Home, DollarSign, Maximize, ChevronRight } from 'lucide-react';
import Card from '../common/Card';  // Import Card from common folder

export default function PropertyCard({ property, isSelected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(property)}
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <Card className={`p-4 ${isSelected ? 'border-blue-500' : 'border-gray-200'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start space-x-2">
              <Home className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 line-clamp-1">
                  {property.address}
                </h3>
                <p className="text-sm text-gray-500 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {property.city}, {property.state} {property.zipCode}
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                <span>${property.marketValue?.toLocaleString()}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Maximize className="h-3 w-3 mr-1 text-blue-600" />
                <span>{property.area || 'N/A'} sqft</span>
              </div>
            </div>

            {property.propertyType && (
              <span className="mt-2 inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {property.propertyType}
              </span>
            )}
          </div>

          <ChevronRight className={`h-5 w-5 flex-shrink-0 transition ${
            isSelected ? 'text-blue-500' : 'text-gray-300'
          }`} />
        </div>
      </Card>
    </div>
  );
}