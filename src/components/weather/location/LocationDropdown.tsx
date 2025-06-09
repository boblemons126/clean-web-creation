
import React from 'react';
import { MapPin, Heart, Star } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocationContext } from '@/contexts/LocationContext';
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
  const { customLocations, selectedLocationId, favoriteLocations } = useLocationContext();
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

  const formatLocationDetails = (location: any) => {
    const parts = [];
    if (location.postcode) parts.push(location.postcode);
    if (location.county) parts.push(location.county);
    if (location.country && location.country !== 'United Kingdom') parts.push(location.country);
    else parts.push('UK');
    return parts.join(', ');
  };

  const getLocationIcon = (type: any) => {
    switch (type) {
      case 'city': return '🏙️';
      case 'town': return '🏘️';
      case 'village': return '🏡';
      case 'postcode': return '📮';
      case 'county': return '🗺️';
      default: return '📍';
    }
  };

  // Separate favorites and regular locations
  const favoriteCustomLocations = customLocations.filter(loc => favoriteLocations.includes(loc.id));
  const regularCustomLocations = customLocations.filter(loc => !favoriteLocations.includes(loc.id));

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
        <SelectContent className="bg-slate-800 border border-slate-700 shadow-2xl rounded-xl p-2 min-w-[280px] z-50">
          {config.useDeviceLocation !== false && (
            <SelectItem 
              value="current" 
              className="cursor-pointer hover:bg-blue-600/30 rounded-lg p-3 transition-all duration-200 border-none focus:bg-blue-600/30 mb-1 text-white"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white text-sm">Device Location</span>
                  <span className="text-xs text-gray-300 leading-relaxed">
                    {displayDeviceLocation}{displayDeviceCounty && `, ${displayDeviceCounty}`}
                  </span>
                </div>
              </div>
            </SelectItem>
          )}
          
          {/* Favorite Locations */}
          {favoriteCustomLocations.length > 0 && (
            <>
              {config.useDeviceLocation !== false && (
                <div className="border-t border-slate-600/50 my-2"></div>
              )}
              <div className="px-3 py-1 mb-1">
                <span className="text-xs font-medium text-yellow-400 flex items-center">
                  <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                  Favorites
                </span>
              </div>
              {favoriteCustomLocations.map((location) => (
                <SelectItem 
                  key={location.id} 
                  value={location.id} 
                  className="cursor-pointer hover:bg-yellow-400/20 rounded-lg p-3 transition-all duration-200 border-none focus:bg-yellow-400/20 mb-1 text-white data-[state=checked]:bg-yellow-400/30"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg shadow-sm">
                      <Star className="w-4 h-4 text-slate-800 fill-current" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-yellow-200 text-sm">{location.name}</span>
                      <span className="text-xs text-gray-300 leading-relaxed">
                        {getLocationIcon(location.type)} {formatLocationDetails(location)}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
          
          {/* Regular Custom Locations */}
          {regularCustomLocations.length > 0 && (
            <>
              {(favoriteCustomLocations.length > 0 || config.useDeviceLocation !== false) && (
                <div className="border-t border-slate-600/50 my-2"></div>
              )}
              {favoriteCustomLocations.length === 0 && regularCustomLocations.length > 0 && (
                <div className="px-3 py-1 mb-1">
                  <span className="text-xs font-medium text-gray-400">Custom Locations</span>
                </div>
              )}
              {regularCustomLocations.map((location) => (
                <SelectItem 
                  key={location.id} 
                  value={location.id} 
                  className="cursor-pointer hover:bg-slate-700/50 rounded-lg p-3 transition-all duration-200 border-none focus:bg-slate-700/50 mb-1 text-white"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg shadow-sm">
                      <span className="text-base">{getLocationIcon(location.type)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-white text-sm">{location.name}</span>
                      <span className="text-xs text-gray-300 leading-relaxed">
                        {formatLocationDetails(location)}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationDropdown;
