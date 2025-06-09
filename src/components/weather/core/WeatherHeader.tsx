
import React from 'react';
import { MapPin, RefreshCw } from 'lucide-react';
import LocationDropdown from '../location/LocationDropdown';

interface WeatherHeaderProps {
  location: string;
  county?: string;
  deviceLocation?: string;
  deviceCounty?: string;
  onRefresh: () => void;
  onLocationChange?: (locationId: string | null) => void;
  hideRefreshButton?: boolean;
}

const WeatherHeader: React.FC<WeatherHeaderProps> = ({ 
  location, 
  county, 
  deviceLocation,
  deviceCounty,
  onRefresh, 
  onLocationChange,
  hideRefreshButton = false
}) => {
  return (
    <div className="flex items-start justify-between w-full">
      <div className="flex items-start space-x-1">
        {onLocationChange ? (
          <LocationDropdown 
            currentLocation={location}
            currentCounty={county}
            deviceLocation={deviceLocation}
            deviceCounty={deviceCounty}
            onLocationChange={onLocationChange}
          />
        ) : (
          <>
            <MapPin className="w-4 h-4 mt-0.5" />
            <div>
              <div className="font-semibold text-base leading-tight">{location}</div>
              {county && <div className="text-sm opacity-70">{county}</div>}
            </div>
          </>
        )}
      </div>
      {!hideRefreshButton && (
        <button 
          onClick={onRefresh} 
          className="p-2 hover:bg-white/20 rounded-lg transition-colors" 
          title="Refresh weather data"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default WeatherHeader;
