import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Thermometer, RefreshCw, Move, Wind, Sun, Droplets, Trash2, Plus, Star, StarOff, Search, Loader2, Navigation } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useWeatherData } from '@/hooks/useWeatherData';
import { getWeatherIcon } from '@/utils/weatherUtils';
import { useLocationContext } from '@/contexts/LocationContext';
import { enhancedLocationService, LocationSearchResult, UserLocation } from '@/services/enhancedLocationService';
import { useDebounce } from 'use-debounce';
import { cn } from '@/lib/utils';

// Expanded color presets with more shades
const colorPresets = [
  { name: 'Blue', value: '#1e3a8a' },
  { name: 'Royal Blue', value: '#1d4ed8' },
  { name: 'Sky Blue', value: '#0ea5e9' },
  { name: 'Purple', value: '#5b21b6' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Green', value: '#065f46' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Orange', value: '#9a3412' },
  { name: 'Red', value: '#991b1b' },
  { name: 'Slate', value: '#0f172a' },
  { name: 'Gray', value: '#1f2937' },
  { name: 'Neutral', value: '#262626' },
];

const hueGradient = [
  'hsl(0, 100%, 50%)',    // Red
  'hsl(60, 100%, 50%)',   // Yellow
  'hsl(120, 100%, 50%)',  // Green
  'hsl(180, 100%, 50%)',  // Cyan
  'hsl(240, 100%, 50%)',  // Blue
  'hsl(300, 100%, 50%)',  // Magenta
  'hsl(360, 100%, 50%)'   // Red again
];

interface WeatherSettingsProps {
  onSettingsChange: () => void;
}

const WeatherSettings: React.FC<WeatherSettingsProps> = ({ onSettingsChange }) => {
  const { settings, updateWidgetSettings } = useSettings();
  const widget = settings.widgets.find(w => w.id === 'weather');
  const config = widget?.config || {};
  const { weather, loading } = useWeatherData();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('picker');
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  
  // Location Search State
  const { customLocations, addCustomLocation, removeCustomLocation, favoriteLocations, toggleFavoriteLocation } = useLocationContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 150);
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyLocations, setNearbyLocations] = useState<LocationSearchResult[]>([]);
  const [showAllLocations, setShowAllLocations] = useState(false);
  
  // HSL state for color picker
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);

  // State and ref for draggable popover
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Get user location and nearby locations
  useEffect(() => {
    const getUserLocation = async () => {
      const location = await enhancedLocationService.getCurrentUserLocation();
      setUserLocation(location);
      
      if (location) {
        // Get nearby locations
        const nearby = await enhancedLocationService.searchLocations('', location, 8, true);
        setNearbyLocations(nearby);
      }
    };

    getUserLocation();
  }, []);

  // Enhanced search with fuzzy matching
  useEffect(() => {
    const searchLocations = async () => {
      if (debouncedQuery.length < 1) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const directResults = await enhancedLocationService.searchLocations(
          debouncedQuery,
          userLocation || undefined,
          10
        );

        setSearchResults(directResults);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchLocations();
  }, [debouncedQuery, userLocation]);

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const body = document.body;
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      body.style.cursor = 'move';
      body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      body.style.cursor = '';
      body.style.userSelect = '';
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const updateConfig = (newConfig: any) => {
    const updatedWidgets = settings.widgets.map(w => {
      if (w.id === 'weather') {
        return {
          ...w,
          config: {
            ...w.config,
            ...newConfig
          }
        };
      }
      return w;
    });
    updateWidgetSettings(updatedWidgets);
    onSettingsChange();
  };

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const updateFromHSL = () => {
    const hex = hslToHex(hue, saturation, lightness);
    updateConfig({ customBackgroundColor: hex });
  };

  const handleAddLocation = (location: LocationSearchResult) => {
    const customLocation = {
      id: `${location.latitude},${location.longitude}`,
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      county: location.county,
      country: location.country,
      postcode: location.postcode,
      type: location.type,
    };

    addCustomLocation(customLocation);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getLocationIcon = (type: LocationSearchResult['type']) => {
    switch (type) {
      case 'city': return '🏙️';
      case 'town': return '🏘️';
      case 'village': return '🏡';
      case 'postcode': return '📮';
      case 'county': return '🗺️';
      default: return '📍';
    }
  };

  const formatFullLocationDetails = (location: any) => {
    const parts = [];
    if (location.name) parts.push(location.name);
    if (location.postcode) parts.push(location.postcode);
    if (location.county) parts.push(location.county);
    if (location.country) parts.push(location.country);
    return parts.join(', ');
  };

  const formatLocationSubtext = (location: LocationSearchResult) => {
    const parts = [];
    if (location.postcode) parts.push(location.postcode);
    if (location.county) parts.push(location.county);
    if (location.country && location.country !== 'United Kingdom') parts.push(location.country);
    else if (!location.country || location.country === 'United Kingdom') parts.push('UK');
    return parts.join(', ');
  };

  // Separate locations into visible and faded groups - showing only 2 before fade
  const visibleLocationCount = 2;
  const favoriteCustomLocations = customLocations.filter(loc => favoriteLocations.includes(loc.id));
  const regularCustomLocations = customLocations.filter(loc => !favoriteLocations.includes(loc.id));
  
  const allSortedLocations = [...favoriteCustomLocations, ...regularCustomLocations];
  const visibleLocations = showAllLocations ? allSortedLocations : allSortedLocations.slice(0, visibleLocationCount);
  const fadedLocations = showAllLocations ? [] : allSortedLocations.slice(visibleLocationCount);

  const WeatherWidgetPreview = ({ color }: { color: string }) => {
    const defaultGlow = 15; // Default glow amount for visual aesthetics
    
    const celsiusToFahrenheit = (celsius: number) => Math.round(celsius * 9 / 5 + 32);
    const temperatureUnit = config.temperatureUnit ?? 'celsius';
    const displayTemperature = (celsius: number) => {
      if (temperatureUnit === 'fahrenheit') {
        return celsiusToFahrenheit(celsius);
      }
      return celsius;
    };

    if (loading || !weather) {
      return (
        <div 
          className="relative rounded-xl p-4 text-white shadow-lg overflow-hidden animate-pulse"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}dd, ${color}bb)`,
            boxShadow: `0 0 ${defaultGlow}px ${color}66, 0 0 ${defaultGlow * 2}px ${color}33`
          }}
        >
          <div className="space-y-3">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-8 bg-white/20 rounded w-1/2"></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-12 bg-white/20 rounded"></div>
              <div className="h-12 bg-white/20 rounded"></div>
              <div className="h-12 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="relative rounded-xl p-4 text-white shadow-lg overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}dd, ${color}bb)`,
          boxShadow: `0 0 ${defaultGlow}px ${color}66, 0 0 ${defaultGlow * 2}px ${color}33`
        }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-white/5 rounded-full"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-1">
              <MapPin className="w-3 h-3 mt-0.5" />
              <div>
                <div className="font-semibold text-sm leading-tight">{weather.location}</div>
                {weather.county && <div className="text-xs opacity-70">{weather.county}</div>}
              </div>
            </div>
          </div>

          {/* Current weather */}
          <div className="flex items-center space-x-3 mb-4">
            {getWeatherIcon(weather.condition, "w-10 h-10")}
            <div>
              <div className="text-2xl font-bold">{displayTemperature(weather.temperature)}°</div>
              <div className="text-xs opacity-80 capitalize">{weather.description}</div>
              <div className="text-xs opacity-70">Feels like {displayTemperature(weather.feelsLike)}°</div>
            </div>
          </div>

          {/* Weather details */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 text-center">
              <Droplets className="w-3 h-3 mx-auto mb-1" />
              <div className="text-xs opacity-80">Humidity</div>
              <div className="font-semibold text-sm">{weather.humidity}%</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 text-center">
              <Wind className="w-3 h-3 mx-auto mb-1" />
              <div className="text-xs opacity-80">Wind</div>
              <div className="font-semibold text-sm">{weather.windSpeed} mph</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 text-center">
              <Sun className="w-3 h-3 mx-auto mb-1" />
              <div className="text-xs opacity-80">Sunset</div>
              <div className="font-semibold text-sm">{weather.sunset}</div>
            </div>
          </div>

          {/* Mini forecast */}
          <div className="flex space-x-2">
            {weather.hourlyForecast.slice(0, 4).map((hour, index) => (
              <div key={index} className="bg-white/15 backdrop-blur-sm rounded-lg p-1.5 text-center min-w-0 flex-1">
                <div className="text-xs opacity-80">{hour.hour}</div>
                {getWeatherIcon(hour.condition, "w-3 h-3 mx-auto my-1")}
                <div className="text-xs font-semibold">{displayTemperature(hour.temperature)}°</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Thermometer className="w-5 h-5 mr-2" />
            Display Settings
          </CardTitle>
          <CardDescription className="text-blue-200">
            Configure how weather information is displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Use Dynamic Colour Grading</Label>
              <p className="text-sm text-gray-300">Enable automatic weather-based background colors</p>
            </div>
            <Switch
              checked={config.useDynamicColoring ?? true}
              onCheckedChange={(checked) => updateConfig({ useDynamicColoring: checked })}
            />
          </div>

          {!config.useDynamicColoring && (
            <div className="ml-6 flex items-stretch gap-4">
              <div
                className="w-0.5 rounded-full"
                style={{
                  backgroundColor: config.customBackgroundColor || 'rgba(255, 255, 255, 0.2)',
                  boxShadow: `0 0 8px ${config.customBackgroundColor || 'transparent'}`,
                }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white">Custom Background Color</Label>
                    <p className="text-sm text-gray-300">Override the weather-based background with a custom color</p>
                  </div>
                  <Popover 
                    open={colorPickerOpen} 
                    onOpenChange={(isOpen) => {
                      setColorPickerOpen(isOpen);
                      if (!isOpen) {
                        setPosition({ x: 0, y: 0 });
                        setIsDragging(false);
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-[140px] h-8 border-2 relative group"
                        style={{
                          backgroundColor: config.customBackgroundColor ?? '#1e3a8a',
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          boxShadow: `0 0 20px ${config.customBackgroundColor ?? '#1e3a8a'}66, 0 0 40px ${config.customBackgroundColor ?? '#1e3a8a'}33`
                        }}
                      >
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                        <div className="relative flex items-center justify-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2 border-2 border-white/20"
                            style={{ backgroundColor: config.customBackgroundColor ?? '#1e3a8a' }}
                          />
                          <span className="text-white/90 text-sm">Select Color</span>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-64 p-0 bg-slate-900/95 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/40 rounded-lg overflow-hidden"
                      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <div
                        onMouseDown={handleMouseDown}
                        className="flex items-center justify-center p-2 bg-slate-800/70 cursor-move text-white/50 text-xs"
                      >
                        <Move className="w-3 h-3 mr-2" />
                        Drag to reposition
                      </div>
                      <div className="p-4">
                        <Tabs defaultValue="picker" value={selectedTab} onValueChange={setSelectedTab}>
                          <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
                            <TabsTrigger value="picker" className="text-white data-[state=active]:bg-slate-700">
                              Color Picker
                            </TabsTrigger>
                            <TabsTrigger value="presets" className="text-white data-[state=active]:bg-slate-700">
                              Presets
                            </TabsTrigger>
                          </TabsList>
                          <div className="mt-4">
                            <TabsContent value="picker" className="mt-0">
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-white mb-2 block font-medium">Hue</Label>
                                  <div className="h-4 rounded-lg mb-2" style={{
                                    background: `linear-gradient(to right, ${hueGradient.join(', ')})`
                                  }} />
                                  <Slider
                                    value={[hue]}
                                    min={0}
                                    max={360}
                                    step={1}
                                    onValueChange={(value) => {
                                      setHue(value[0]);
                                      updateFromHSL();
                                    }}
                                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-white/50 [&>.relative>div:first-child]:bg-white [&>.relative>div:last-child]:bg-transparent"
                                  />
                                </div>
                                <div>
                                  <Label className="text-white mb-2 block font-medium">Saturation</Label>
                                  <div className="h-4 rounded-lg mb-2" style={{
                                    background: `linear-gradient(to right, 
                                      hsl(${hue}, 0%, ${lightness}%), 
                                      hsl(${hue}, 100%, ${lightness}%))`
                                  }} />
                                  <Slider
                                    value={[saturation]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => {
                                      setSaturation(value[0]);
                                      updateFromHSL();
                                    }}
                                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-white/50 [&>.relative>div:first-child]:bg-white [&>.relative>div:last-child]:bg-transparent"
                                  />
                                </div>
                                <div>
                                  <Label className="text-white mb-2 block font-medium">Lightness</Label>
                                  <div className="h-4 rounded-lg mb-2" style={{
                                    background: `linear-gradient(to right, 
                                      hsl(${hue}, ${saturation}%, 0%), 
                                      hsl(${hue}, ${saturation}%, 100%))`
                                  }} />
                                  <Slider
                                    value={[lightness]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => {
                                      setLightness(value[0]);
                                      updateFromHSL();
                                    }}
                                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-white/50 [&>.relative>div:first-child]:bg-white [&>.relative>div:last-child]:bg-transparent"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-white block font-medium">Weather Widget Preview</Label>
                                  <WeatherWidgetPreview color={hslToHex(hue, saturation, lightness)} />
                                </div>
                              </div>
                            </TabsContent>
                            <TabsContent value="presets" className="mt-0">
                              <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                  {colorPresets.map((color) => (
                                    <Button
                                      key={color.value}
                                      variant="outline"
                                      className="relative group p-0 h-12 border-2 rounded-lg overflow-hidden transition-all duration-200"
                                      style={{
                                        backgroundColor: color.value,
                                        borderColor: config.customBackgroundColor === color.value 
                                          ? 'white' 
                                          : 'rgba(255, 255, 255, 0.1)',
                                        boxShadow: hoveredColor === color.value 
                                          ? `0 0 20px ${color.value}33` 
                                          : 'none'
                                      }}
                                      onClick={() => updateConfig({ customBackgroundColor: color.value })}
                                      onPointerEnter={() => setHoveredColor(color.value)}
                                      onPointerLeave={() => setHoveredColor(null)}
                                    >
                                      <div 
                                        className="absolute inset-0 transition-opacity duration-200"
                                        style={{
                                          backgroundColor: hoveredColor === color.value 
                                            ? `${color.value}33`
                                            : 'transparent'
                                        }}
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span 
                                          className="text-white text-xs font-medium px-2 py-1 rounded-full"
                                          style={{
                                            backgroundColor: hoveredColor === color.value 
                                              ? `${color.value}99`
                                              : 'rgba(0, 0, 0, 0.4)'
                                          }}
                                        >
                                          {color.name}
                                        </span>
                                      </div>
                                    </Button>
                                  ))}
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-white block font-medium">Weather Widget Preview</Label>
                                  <WeatherWidgetPreview color={config.customBackgroundColor ?? '#1e3a8a'} />
                                </div>
                              </div>
                            </TabsContent>
                          </div>
                        </Tabs>
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => setColorPickerOpen(false)}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Temperature Unit</Label>
              <p className="text-sm text-gray-300">Choose your preferred temperature scale</p>
            </div>
            <Select
              value={config.temperatureUnit ?? 'celsius'}
              onValueChange={(value) => updateConfig({ temperatureUnit: value })}
            >
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="celsius">Celsius (°C)</SelectItem>
                <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Show Advanced Info</Label>
              <p className="text-sm text-gray-300">Display humidity, wind and sunset time</p>
            </div>
            <Switch
              checked={config.showAdvancedInfo ?? true}
              onCheckedChange={(checked) => updateConfig({ showAdvancedInfo: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Show Forecast Info</Label>
              <p className="text-sm text-gray-300">Display forecast information</p>
            </div>
            <Switch
              checked={config.showForecastInfo ?? true}
              onCheckedChange={(checked) => updateConfig({ showForecastInfo: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Location Settings
          </CardTitle>
          <CardDescription className="text-blue-200">
            Manage your weather location preferences and custom locations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Use Device Location</Label>
              <p className="text-sm text-gray-300">Automatically detect your current location</p>
            </div>
            <Switch
              checked={config.useDeviceLocation ?? true}
              onCheckedChange={(checked) => updateConfig({ useDeviceLocation: checked })}
            />
          </div>

          {/* Enhanced Location Search */}
          <div className="space-y-4">
            <div>
              <Label className="text-white">Add New Location</Label>
              <p className="text-sm text-gray-300">Search and add locations worldwide</p>
            </div>

            <Card className="bg-white/5 border-white/10 p-4">
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search for any location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 transition-all"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>

                {/* Nearby Locations - small bubbles */}
                {!searchQuery && userLocation && nearbyLocations.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Navigation className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-white font-medium">📍 Nearby Locations</span>
                      <span className="text-xs text-gray-400">({nearbyLocations.length} found)</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {nearbyLocations.slice(0, 12).map((location) => (
                        <button
                          key={location.id}
                          onClick={() => handleAddLocation(location)}
                          className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded-full px-3 py-1.5 transition-all duration-200 group"
                        >
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs">{getLocationIcon(location.type)}</span>
                            <span className="text-xs text-white font-medium truncate max-w-[100px]">
                              {location.name}
                            </span>
                            <Plus className="w-2.5 h-2.5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Search Results */}
                {searchResults.length > 0 && searchQuery && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    <div className="text-sm text-white font-medium mb-2">
                      🔍 Search Results ({searchResults.length} results)
                    </div>
                    {searchResults.map((location, index) => {
                      return (
                        <div
                          key={location.id}
                          className="flex items-center justify-between p-3 rounded-lg border transition-colors group cursor-pointer bg-white/5 border-white/10 hover:bg-white/10"
                          onClick={() => handleAddLocation(location)}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <span className="text-lg">{getLocationIcon(location.type)}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-white truncate">
                                  {location.name}
                                </span>
                                {location.distance !== undefined && (
                                  <span className="text-xs px-2 py-0.5 rounded-full text-blue-200 bg-blue-500/20">
                                    📏 {location.distance}km away
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 truncate mt-1">
                                📍 {formatLocationSubtext(location)}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white opacity-0 group-hover:opacity-100 transition-opacity ml-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddLocation(location);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* No Results */}
                {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                  <div className="bg-white/5 border-white/10 p-6 text-center rounded-lg">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-white font-medium mb-1">❌ No locations found</p>
                    <p className="text-sm text-gray-400">
                      Try a different search term or check spelling
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Updated Saved Locations List with emojis and brighter gold favorites */}
            {customLocations.length > 0 ? (
              <div className="space-y-2">
                <Label className="text-white text-sm">💾 Saved Locations ({customLocations.length})</Label>
                <div className="grid gap-2">
                  {/* Visible Locations - only show 2 before fade */}
                  {visibleLocations.map((location) => {
                    const isFavorite = favoriteLocations.includes(location.id);
                    return (
                      <div 
                        key={location.id} 
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg border transition-colors group",
                          isFavorite 
                            ? "bg-yellow-400/20 border-yellow-400/40 hover:bg-yellow-400/30" 
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            isFavorite 
                              ? "bg-yellow-400/30" 
                              : "bg-blue-500/20"
                          )}>
                            <span className="text-base">{getLocationIcon(location.type)}</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">{location.name}</span>
                            </div>
                            <p className="text-xs text-gray-400">
                              📍 {formatFullLocationDetails(location)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleFavoriteLocation(location.id)}
                            className={cn(
                              "hover:bg-yellow-400/20",
                              isFavorite ? "text-yellow-300" : "text-yellow-400 hover:text-yellow-300"
                            )}
                          >
                            {isFavorite ? (
                              <StarOff className="w-4 h-4" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeCustomLocation(location.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Faded Locations */}
                  {fadedLocations.length > 0 && (
                    <div className="space-y-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 rounded-lg pointer-events-none z-10" />
                        <div className="opacity-50 space-y-2 max-h-32 overflow-hidden">
                          {fadedLocations.map((location) => {
                            const isFavorite = favoriteLocations.includes(location.id);
                            return (
                              <div 
                                key={location.id} 
                                className={cn(
                                  "flex items-center justify-between p-4 rounded-lg border transition-colors group",
                                  isFavorite 
                                    ? "bg-yellow-400/20 border-yellow-400/40" 
                                    : "bg-white/5 border-white/10"
                                )}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={cn(
                                    "p-2 rounded-lg",
                                    isFavorite 
                                      ? "bg-yellow-400/30" 
                                      : "bg-blue-500/20"
                                  )}>
                                    <span className="text-base">{getLocationIcon(location.type)}</span>
                                  </div>
                                  <div>
                                    <span className="text-white font-medium">{location.name}</span>
                                    <p className="text-xs text-gray-400">
                                      📍 {formatFullLocationDetails(location)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowAllLocations(!showAllLocations)}
                        className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                      >
                        {showAllLocations ? 'Show Less Locations' : `Show ${fadedLocations.length} More Locations`}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10 p-6 text-center">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-white font-medium mb-1">📍 No custom locations yet</p>
                <p className="text-sm text-gray-400">
                  Start typing in the search box above to add your first location
                </p>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <RefreshCw className="w-5 h-5 mr-2" />
            Update Settings
          </CardTitle>
          <CardDescription className="text-blue-200">
            Configure how often the weather data updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Auto Refresh</Label>
              <p className="text-sm text-gray-300">Automatically update weather data</p>
            </div>
            <Switch
              checked={config.autoRefresh ?? true}
              onCheckedChange={(checked) => updateConfig({ autoRefresh: checked })}
            />
          </div>

          {config.autoRefresh && (
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Refresh Interval</Label>
                <p className="text-sm text-gray-300">How often to update weather data</p>
              </div>
              <Select
                value={String(config.refreshInterval ?? 30)}
                onValueChange={(value) => updateConfig({ refreshInterval: Number(value) })}
              >
                <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherSettings;
