
import { useState, useEffect, useCallback } from 'react';
import { getWeatherData } from '../services/weather';
import type { WeatherData } from '../types/weather';
import { useLocationContext } from '../contexts/LocationContext';

export const useWeatherData = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [deviceLocation, setDeviceLocation] = useState<{ location: string; county?: string } | null>(null);
  const { customLocations, selectedLocationId, setSelectedLocationId } = useLocationContext();

  const fetchWeatherData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let latitude: number, longitude: number;
      
      const selectedLocation = customLocations.find(loc => loc.id === selectedLocationId);

      if (selectedLocation) {
        latitude = selectedLocation.latitude;
        longitude = selectedLocation.longitude;
      } else {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true,
            maximumAge: 300000
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }
      
      console.log('Fetching weather for location:', { latitude, longitude });
      
      const weatherData = await getWeatherData(latitude, longitude);
      console.log('Weather data received:', weatherData);
      
      // If this is device location (no custom location selected), store it as device location
      if (!selectedLocationId) {
        setDeviceLocation({
          location: weatherData.location,
          county: weatherData.county
        });
      }
      
      setWeather(weatherData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching weather:', error);
      
      if (error instanceof GeolocationPositionError) {
        setError('Location access denied. Please enable location services.');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to fetch weather data');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedLocationId, customLocations]);

  useEffect(() => {
    fetchWeatherData();
    
    const interval = setInterval(fetchWeatherData, 600000); // 10 minutes
    
    return () => clearInterval(interval);
  }, [fetchWeatherData]);

  return {
    weather,
    loading,
    error,
    lastUpdated,
    deviceLocation,
    refetch: fetchWeatherData,
    handleLocationChange: setSelectedLocationId
  };
};
