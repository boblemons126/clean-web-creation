
import React from 'react';
import { MapPin } from 'lucide-react';
import { useLocationContext } from '@/contexts/LocationContext';
import { LocationSearchResult } from '@/services/enhancedLocationService';
import LocationSearchInput from './LocationSearchInput';

interface EnhancedLocationSearchProps {
  onLocationAdded?: () => void;
  onClose?: () => void;
}

const EnhancedLocationSearch: React.FC<EnhancedLocationSearchProps> = ({
  onLocationAdded,
  onClose
}) => {
  const { addCustomLocation } = useLocationContext();

  const handleLocationSelect = (location: LocationSearchResult) => {
    const customLocation = {
      id: `${location.latitude},${location.longitude}`,
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      county: location.county,
      country: location.country,
      type: location.type,
    };

    addCustomLocation(customLocation);
    
    if (onLocationAdded) onLocationAdded();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <MapPin className="w-5 h-5 text-blue-200" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Smart Location Search</h3>
          <p className="text-sm text-blue-200">
            Enhanced search with location intelligence and suggestions
          </p>
        </div>
      </div>

      <LocationSearchInput
        onLocationSelect={handleLocationSelect}
        placeholder="Search cities, towns, postcodes, or counties..."
        showSuggestions={true}
        className="w-full"
      />
    </div>
  );
};

export default EnhancedLocationSearch;
