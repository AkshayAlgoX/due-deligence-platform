'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home, MapPin, DollarSign, Maximize, 
  User, FileText, ArrowRight,
  Building, Tag, Hash, CheckCircle, XCircle
} from 'lucide-react';

export default function PropertyDetails({ property }) {
  const router = useRouter();

  if (!property) return null;

  const handleGenerateReport = () => {
    router.push(`/property/${property.id}/report`);
  };

  const mockDetails = {
    ownership: {
      owner: 'Simpson Family Trust',
      ownerSince: 'June 12, 1998',
      parcelId: '88-01-23-456-789',
      legalDescription: 'Lot 24, Block 3, Evergreen Heights Sub'
    },
    taxHistory: [
      { year: 2023, assessedValue: 1380000, taxAmount: 14250, status: 'Paid' },
      { year: 2022, assessedValue: 1320000, taxAmount: 13800, status: 'Paid' }
    ],
    buildingInfo: {
      structureType: 'Wood Frame / Stucco',
      condition: 'Excellent',
      stories: '2',
      bedrooms: 4,
      bathrooms: 3
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4">
        <h3 className="text-white font-semibold text-lg">Property Details</h3>
        <p className="text-blue-100 text-sm">Complete property information</p>
      </div>

      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-semibold text-gray-800">{property.address}</h4>
          <p className="text-sm text-gray-500 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {property.city}, {property.state} {property.zipCode}
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-full flex items-center">
              <Tag className="h-3 w-3 mr-1" />
              {property.propertyType || 'N/A'}
            </span>
            <span className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded-full flex items-center">
              <DollarSign className="h-3 w-3 mr-1" />
              ${property.marketValue?.toLocaleString()}
            </span>
            <span className="text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded-full flex items-center">
              <Maximize className="h-3 w-3 mr-1" />
              {property.area || 'N/A'} sqft
            </span>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-semibold text-gray-700 flex items-center mb-2">
            <User className="h-4 w-4 mr-2 text-blue-600" />
            Ownership Information
          </h4>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">Owner:</span> {mockDetails.ownership.owner}</p>
            <p><span className="text-gray-500">Since:</span> {mockDetails.ownership.ownerSince}</p>
            <p><span className="text-gray-500">Parcel ID:</span> {mockDetails.ownership.parcelId}</p>
            <p className="text-gray-500 text-xs">{mockDetails.ownership.legalDescription}</p>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-semibold text-gray-700 flex items-center mb-2">
            <Building className="h-4 w-4 mr-2 text-blue-600" />
            Building Information
          </h4>
          <div className="grid grid-cols-2 gap-1 text-sm">
            <div>
              <span className="text-gray-500">Structure:</span>
              <p className="font-medium">{mockDetails.buildingInfo.structureType}</p>
            </div>
            <div>
              <span className="text-gray-500">Condition:</span>
              <p className="font-medium text-green-600">{mockDetails.buildingInfo.condition}</p>
            </div>
            <div>
              <span className="text-gray-500">Stories:</span>
              <p className="font-medium">{mockDetails.buildingInfo.stories}</p>
            </div>
            <div>
              <span className="text-gray-500">Bed/Bath:</span>
              <p className="font-medium">{mockDetails.buildingInfo.bedrooms} / {mockDetails.buildingInfo.bathrooms}</p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <h4 className="font-semibold text-gray-700 flex items-center mb-2">
            <Hash className="h-4 w-4 mr-2 text-blue-600" />
            Recent Tax History
          </h4>
          <div className="space-y-1 text-sm">
            {mockDetails.taxHistory.map((tax, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{tax.year}</span>
                <span className="font-medium">${tax.assessedValue.toLocaleString()}</span>
                <span className={`flex items-center text-xs ${
                  tax.status === 'Paid' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tax.status === 'Paid' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {tax.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center transition group"
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate Due Diligence Report
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition" />
        </button>
      </div>
    </div>
  );
}