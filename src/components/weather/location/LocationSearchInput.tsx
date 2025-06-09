
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Clock, Star, Loader2, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { enhancedLocationService, LocationSearchResult, UserLocation } from '@/services/enhancedLocationService';
import { useDebounce } from 'use-debounce';
import { cn } from '@/lib/utils';

interface LocationSearchInputProps {
  onLocationSelect: (location: LocationSearchResult) => void;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
}

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  onLocationSelect,
  placeholder = "Search by city, town, postcode, or county...",
  className,
  showSuggestions = true
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [recentSearches, setRecentSearches] = useState<LocationSearchResult[]>([]);
  const [nearbyLocations, setNearbyLocations] = useState<LocationSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches and get nearby locations
  useEffect(() => {
    const stored = localStorage.getItem('recentLocationSearches');
    if (stored) {
      try {
        const recent = JSON.parse(stored);
        setRecentSearches(recent.slice(0, 5));
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    }
  }, []);

  // Get user location and nearby locations on mount
  useEffect(() => {
    const getUserLocation = async () => {
      setIsGettingLocation(true);
      const location = await enhancedLocationService.getCurrentUserLocation();
      setUserLocation(location);
      
      if (location) {
        // Get nearby locations
        const nearby = await enhancedLocationService.searchLocations('', location, 8, true);
        setNearbyLocations(nearby);
      }
      setIsGettingLocation(false);
    };

    getUserLocation();
  }, []);

  // Smart search with enhanced results
  useEffect(() => {
    const searchLocations = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        setSelectedIndex(-1);
        return;
      }

      setIsSearching(true);
      try {
        // Get search results
        let searchResults = await enhancedLocationService.searchLocations(
          debouncedQuery,
          userLocation || undefined,
          10
        );

        // Add smart ranking based on query similarity and user location
        searchResults = searchResults.map(result => ({
          ...result,
          relevanceScore: calculateRelevanceScore(result, debouncedQuery, userLocation)
        }));

        // Sort by relevance score
        searchResults.sort((a: any, b: any) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

        setResults(searchResults.slice(0, 8));
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchLocations();
  }, [debouncedQuery, userLocation]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDropdown) return;

      const totalResults = results.length;
      if (totalResults === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < totalResults - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < totalResults) {
            handleLocationSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowDropdown(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex, showDropdown]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const calculateRelevanceScore = (
    result: LocationSearchResult, 
    query: string, 
    userLoc?: UserLocation | null
  ): number => {
    let score = 0;
    const queryLower = query.toLowerCase();
    const nameLower = result.name.toLowerCase();

    // Exact match gets highest score
    if (nameLower === queryLower) score += 100;
    else if (nameLower.startsWith(queryLower)) score += 80;
    else if (nameLower.includes(queryLower)) score += 60;

    // Check county matches
    if (result.county && result.county.toLowerCase().includes(queryLower)) {
      score += 40;
    }

    // Proximity bonus if user location available
    if (userLoc && result.distance !== undefined) {
      const proximityBonus = Math.max(0, 20 - (result.distance / 10));
      score += proximityBonus;
    }

    // Type priority (cities > towns > villages)
    switch (result.type) {
      case 'city': score += 10; break;
      case 'town': score += 5; break;
      case 'postcode': score += 15; break; // Postcodes are very specific
    }

    return score;
  };

  const saveRecentSearch = useCallback((location: LocationSearchResult) => {
    const updated = [location, ...recentSearches.filter(s => s.id !== location.id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentLocationSearches', JSON.stringify(updated));
  }, [recentSearches]);

  const handleLocationSelect = useCallback((location: LocationSearchResult) => {
    onLocationSelect(location);
    saveRecentSearch(location);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    setShowDropdown(false);
  }, [onLocationSelect, saveRecentSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(value.length > 0 || showSuggestions);
  };

  const handleInputFocus = () => {
    if (showSuggestions) {
      setShowDropdown(true);
    }
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

  const getTypeColor = (type: LocationSearchResult['type']) => {
    switch (type) {
      case 'city': return 'bg-blue-500/20 text-blue-200';
      case 'town': return 'bg-green-500/20 text-green-200';
      case 'village': return 'bg-purple-500/20 text-purple-200';
      case 'postcode': return 'bg-orange-500/20 text-orange-200';
      case 'county': return 'bg-red-500/20 text-red-200';
      default: return 'bg-gray-500/20 text-gray-200';
    }
  };

  const renderLocationItem = (location: LocationSearchResult, index: number, isHighlighted = false) => (
    <div
      key={location.id}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all group",
        isHighlighted || selectedIndex === index
          ? "bg-blue-500/30 ring-2 ring-blue-500/50" 
          : "hover:bg-white/10"
      )}
      onClick={() => handleLocationSelect(location)}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <span className="text-lg">{getLocationIcon(location.type)}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-white truncate">
              {location.name}
            </span>
            <Badge 
              variant="secondary" 
              className={cn("text-xs px-2 py-0.5", getTypeColor(location.type))}
            >
              {location.type}
            </Badge>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-400 truncate">
              {location.county && `${location.county}, `}{location.country}
            </span>
            {location.distance !== undefined && (
              <span className="text-xs text-blue-200 bg-blue-500/20 px-2 py-0.5 rounded-full">
                {location.distance}km away
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 transition-all"
        />
        {(isSearching || isGettingLocation) && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Location Status */}
      {userLocation && !query && (
        <div className="flex items-center space-x-1 mt-2 text-xs text-green-200">
          <Navigation className="w-3 h-3" />
          <span>Search enhanced with your location</span>
        </div>
      )}

      {/* Smart Dropdown */}
      {showDropdown && (
        <Card 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white/5 border-white/10 p-2 max-h-80 overflow-y-auto z-50"
        >
          {/* Search Results */}
          {query.length >= 2 && results.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-400 px-2 py-1 border-b border-white/10 mb-2">
                Search Results
              </div>
              {results.map((location, index) => renderLocationItem(location, index))}
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && !isSearching && results.length === 0 && (
            <div className="p-6 text-center">
              <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-white font-medium mb-1">No locations found</p>
              <p className="text-sm text-gray-400">
                Try a different city, town, or postcode
              </p>
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-gray-400 px-2 py-1 border-b border-white/10 mb-2 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Recent Searches
              </div>
              {recentSearches.map((location, index) => renderLocationItem(location, index))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default LocationSearchInput;
