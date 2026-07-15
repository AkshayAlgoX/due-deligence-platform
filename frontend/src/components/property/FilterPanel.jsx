'use client';

import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';

export default function FilterPanel({ filters, onFilterChange, onClearFilters }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(val => val !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-700">Filters</span>
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearFilters();
              }}
              className="text-sm text-red-500 hover:text-red-700 flex items-center space-x-1"
            >
              <X className="h-3 w-3" />
              <span>Clear all</span>
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={filters.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="e.g., Portland"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select
                value={filters.propertyType || ''}
                onChange={(e) => handleChange('propertyType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Types</option>
                <option value="SINGLE FAMILY RESIDENCE">Single Family</option>
                <option value="CONDO">Condo</option>
                <option value="TOWNHOUSE">Townhouse</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="MULTI FAMILY">Multi Family</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleChange('minPrice', e.target.value)}
                  placeholder="Min"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleChange('maxPrice', e.target.value)}
                  placeholder="Max"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq ft)</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={filters.minArea || ''}
                  onChange={(e) => handleChange('minArea', e.target.value)}
                  placeholder="Min"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <input
                  type="number"
                  value={filters.maxArea || ''}
                  onChange={(e) => handleChange('maxArea', e.target.value)}
                  placeholder="Max"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}