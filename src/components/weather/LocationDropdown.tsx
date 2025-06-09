
import React from 'react';
import { MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocationContext } from '../../contexts/LocationContext';
import { useSettings } from '@/contexts/SettingsContext';

interface LocationDropdownProps {
  currentLocation: string;
  currentCounty: string | null;
  deviceLocation?: string;
  deviceCounty?: string | null;
  onLocationChange: (locationId: string | null) => void;
}

const LocationDropdown: React.FC<LocationDropdownProps> = ({
  currentLocation,
  currentCounty,
  deviceLocation,
  deviceCounty,
  onLocationChange
}) => {
  const { customLocations, selectedLocationId } = useLocationContext();
  const { settings } = useSettings();
  const widget = settings.widgets.find(w => w.id === 'weather');
  const config = widget?.config || {};

  const handleValueChange = (value: string) => {
    if (value === 'current') {
      onLocationChange(null);
    } else {
      onLocationChange(value);
    }
  };

  const getDisplayValue = () => {
    if (selectedLocationId) {
      const customLocation = customLocations.find(loc => loc.id === selectedLocationId);
      return customLocation?.name || currentLocation;
    }
    return currentLocation;
  };

  // Use device location if provided, otherwise fall back to current location
  const displayDeviceLocation = deviceLocation || currentLocation;
  const displayDeviceCounty = deviceCounty || currentCounty;

  return (
    <div className="flex items-center space-x-2">
      <MapPin className="w-4 h-4 flex-shrink-0" />
      <Select
        value={selectedLocationId || 'current'}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="bg-transparent border-none p-0 h-auto text-white hover:bg-white/10 rounded w-fit">
          <div className="flex flex-col items-start">
            <SelectValue>
              <div>
                <span className="font-semibold text-base leading-tight">{getDisplayValue()}</span>
                {currentCounty && !selectedLocationId && (
                  <span className="text-sm opacity-70 ml-1">{currentCounty}</span>
                )}
              </div>
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white/95 backdrop-blur-md border border-white/30 shadow-2xl rounded-xl p-2 min-w-[280px] animate-in fade-in-0 zoom-in-95 duration-200">
          {config.useDeviceLocation !== false && (
            <SelectItem 
              value="current" 
              className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg p-3 transition-all duration-200 border-none focus:bg-gradient-to-r focus:from-blue-50 focus:to-indigo-50 mb-1"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-900 text-sm">📍 Device Location</span>
                  <span className="text-xs text-gray-600 leading-relaxed">
                    {displayDeviceLocation}{displayDeviceCounty && `, ${displayDeviceCounty}`}
                  </span>
                </div>
              </div>
            </SelectItem>
          )}
          
          {customLocations.length > 0 && config.useDeviceLocation !== false && (
            <div className="border-t border-gray-200 my-2"></div>
          )}
          
          {customLocations.map((location) => (
            <SelectItem 
              key={location.id} 
              value={location.id} 
              className="cursor-pointer hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 rounded-lg p-3 transition-all duration-200 border-none focus:bg-gradient-to-r focus:from-emerald-50 focus:to-teal-50 mb-1"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-sm">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-gray-900 text-sm">{location.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationDropdown;
