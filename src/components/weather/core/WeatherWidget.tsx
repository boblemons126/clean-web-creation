import React, { useState } from 'react';
import { RefreshCw, Palette } from 'lucide-react';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useLocationContext } from '@/contexts/LocationContext';
import { useSettings } from '@/contexts/SettingsContext';
import { getGradientByCondition } from '@/utils/weatherUtils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import WeatherHeader from './WeatherHeader';
import CurrentWeather from './CurrentWeather';
import WeatherDetails from './WeatherDetails';
import ForecastToggle from '../forecast/ForecastToggle';
import WeatherForecast from '../forecast/WeatherForecast';
import CustomColorPicker from '../customization/CustomColorPicker';

const colorPresets = [
  { name: 'Blue', value: '#1e3a8a' },
  { name: 'Purple', value: '#5b21b6' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Green', value: '#065f46' },
  { name: 'Orange', value: '#9a3412' },
  { name: 'Red', value: '#991b1b' },
  { name: 'Gray', value: '#1f2937' },
  { name: 'Teal', value: '#0f766e' },
];

const WeatherWidget = () => {
  const { weather, loading, error, lastUpdated, refetch, handleLocationChange } = useWeatherData();
  const { setSelectedLocationId } = useLocationContext();
  const { settings } = useSettings();
  const weatherSettings = settings.widgets.find(w => w.id === 'weather')?.config || {};
  const [showHourly, setShowHourly] = useState(true);

  const getBackgroundStyle = () => {
    // Only use custom color if dynamic coloring is disabled and a custom color is set
    if (!weatherSettings.useDynamicColoring && weatherSettings.customBackgroundColor) {
      const color = weatherSettings.customBackgroundColor;
      return {
        background: `linear-gradient(135deg, ${color}, ${color}dd, ${color}bb)`
      };
    }
    return {};
  };

  const getBackgroundClass = () => {
    // Only use custom color if dynamic coloring is disabled, otherwise use dynamic colors
    if (!weatherSettings.useDynamicColoring && weatherSettings.customBackgroundColor) {
      return '';
    } else {
      return `bg-gradient-to-br ${getGradientByCondition(weather?.condition || 'clear')}`;
    }
  };

  const celsiusToFahrenheit = (celsius: number) => Math.round(celsius * 9 / 5 + 32);

  const temperatureUnit = weatherSettings.temperatureUnit ?? 'celsius';

  const convertedWeather = weather && {
    ...weather,
    temperature: temperatureUnit === 'fahrenheit' ? celsiusToFahrenheit(weather.temperature) : weather.temperature,
    feelsLike: temperatureUnit === 'fahrenheit' ? celsiusToFahrenheit(weather.feelsLike) : weather.feelsLike,
    hourlyForecast: weather.hourlyForecast.map(hour => ({
      ...hour,
      temperature: temperatureUnit === 'fahrenheit' ? celsiusToFahrenheit(hour.temperature) : hour.temperature,
    })),
    dailyForecast: weather.dailyForecast.map(day => ({
      ...day,
      high: temperatureUnit === 'fahrenheit' ? celsiusToFahrenheit(day.high) : day.high,
      low: temperatureUnit === 'fahrenheit' ? celsiusToFahrenheit(day.low) : day.low,
    })),
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-white/20 rounded w-24"></div>
            <div className="h-8 bg-white/20 rounded w-16"></div>
          </div>
          <div className="h-12 bg-white/20 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="h-16 bg-white/20 rounded"></div>
            <div className="h-16 bg-white/20 rounded"></div>
            <div className="h-16 bg-white/20 rounded"></div>
          </div>
          <div className="h-20 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-400 via-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="text-center">
          <div className="text-xl font-bold mb-2">Weather Unavailable</div>
          <div className="text-sm opacity-90 mb-4">{error}</div>
          <button 
            onClick={refetch} 
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!convertedWeather) return null;

  return (
    <div 
      className={`${getBackgroundClass()} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden`}
      style={getBackgroundStyle()}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/5 rounded-full"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-1 mt-1">
            <WeatherHeader 
              location={convertedWeather.location}
              county={convertedWeather.county}
              onRefresh={refetch}
              onLocationChange={handleLocationChange}
              hideRefreshButton={true}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={refetch} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Refresh weather data">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <CurrentWeather 
          temperature={convertedWeather.temperature}
          condition={convertedWeather.condition}
          description={convertedWeather.description}
          feelsLike={convertedWeather.feelsLike}
        />
        
        {(weatherSettings.showAdvancedInfo ?? true) && (
          <WeatherDetails 
            humidity={convertedWeather.humidity}
            windSpeed={convertedWeather.windSpeed}
            windDirection={convertedWeather.windDirection}
            sunset={convertedWeather.sunset}
          />
        )}
        
        {(weatherSettings.showForecastInfo ?? true) && (
          <>
            <ForecastToggle 
              showHourly={showHourly}
              onToggle={setShowHourly}
            />
            
            <WeatherForecast 
              showHourly={showHourly}
              hourlyForecast={convertedWeather.hourlyForecast}
              dailyForecast={convertedWeather.dailyForecast}
            />
          </>
        )}
        
        {lastUpdated && (
          <div className="text-xs opacity-60 mt-4 text-center">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget; 