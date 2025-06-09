
export interface LocationSearchResult {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  county?: string;
  country?: string;
  postcode?: string;
  type: 'city' | 'town' | 'village' | 'postcode' | 'county';
  distance?: number;
  relevanceScore?: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

interface SearchOptions {
  fuzzyMatch?: boolean;
  sortByPopularity?: boolean;
  includeNearby?: boolean;
  maxDistance?: number;
}

class EnhancedLocationService {
  private readonly apiKey = 'INVALID_KEY'; // This key is invalid, we'll use fallback
  private readonly baseUrl = 'https://api.opencagedata.com/geocode/v1/json';

  async getCurrentUserLocation(): Promise<UserLocation | null> {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true,
          maximumAge: 300000
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (error) {
      console.error('Failed to get user location:', error);
      return null;
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/[^\w\s]/g, '');
  }

  // Enhanced fuzzy matching with typo tolerance
  private fuzzyMatch(query: string, text: string, threshold = 0.6): boolean {
    const normalizedQuery = this.normalizeQuery(query);
    const normalizedText = this.normalizeQuery(text);
    
    // Exact match
    if (normalizedText.includes(normalizedQuery)) return true;
    
    // Check if all words in query appear in text (order doesn't matter)
    const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0);
    const textWords = normalizedText.split(/\s+/);
    
    const matchedWords = queryWords.filter(queryWord => 
      textWords.some(textWord => {
        // Direct inclusion
        if (textWord.includes(queryWord) || queryWord.includes(textWord)) return true;
        
        // Levenshtein distance for typo tolerance
        return this.levenshteinDistance(queryWord, textWord) <= Math.max(1, Math.floor(queryWord.length * 0.3));
      })
    );
    
    return matchedWords.length / queryWords.length >= threshold;
  }

  // Simple Levenshtein distance for typo tolerance
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Generate search suggestions based on partial input
  private generateSuggestions(query: string): string[] {
    const suggestions = [];
    const queryLower = query.toLowerCase();
    
    // Common UK location patterns
    const patterns = [
      'greater manchester', 'west yorkshire', 'south yorkshire', 'west midlands',
      'greater london', 'merseyside', 'tyne and wear', 'devon', 'cornwall',
      'somerset', 'dorset', 'kent', 'surrey', 'essex', 'sussex', 'norfolk',
      'suffolk', 'cambridgeshire', 'oxfordshire', 'hertfordshire', 'buckinghamshire'
    ];
    
    patterns.forEach(pattern => {
      if (pattern.includes(queryLower) && pattern !== queryLower) {
        suggestions.push(pattern);
      }
    });
    
    return suggestions.slice(0, 3);
  }

  // Enhanced fallback data with more locations and better categorization
  private getFallbackLocations(query?: string, userLocation?: UserLocation, options: SearchOptions = {}): LocationSearchResult[] {
    const ukLocations: LocationSearchResult[] = [
      // Major Cities
      { id: '51.5074,-0.1278', name: 'London', latitude: 51.5074, longitude: -0.1278, county: 'Greater London', country: 'United Kingdom', type: 'city' },
      { id: '53.4808,-2.2426', name: 'Manchester', latitude: 53.4808, longitude: -2.2426, county: 'Greater Manchester', country: 'United Kingdom', type: 'city' },
      { id: '52.4862,-1.8904', name: 'Birmingham', latitude: 52.4862, longitude: -1.8904, county: 'West Midlands', country: 'United Kingdom', type: 'city' },
      { id: '53.7997,-1.5492', name: 'Leeds', latitude: 53.7997, longitude: -1.5492, county: 'West Yorkshire', country: 'United Kingdom', type: 'city' },
      { id: '55.9533,-3.1883', name: 'Edinburgh', latitude: 55.9533, longitude: -3.1883, county: 'City of Edinburgh', country: 'Scotland', type: 'city' },
      { id: '55.8642,-4.2518', name: 'Glasgow', latitude: 55.8642, longitude: -4.2518, county: 'Glasgow City', country: 'Scotland', type: 'city' },
      { id: '53.4084,-2.9916', name: 'Liverpool', latitude: 53.4084, longitude: -2.9916, county: 'Merseyside', country: 'United Kingdom', type: 'city' },
      { id: '51.4816,-3.1791', name: 'Cardiff', latitude: 51.4816, longitude: -3.1791, county: 'Cardiff', country: 'Wales', type: 'city' },
      { id: '54.9783,-1.6178', name: 'Newcastle', latitude: 54.9783, longitude: -1.6178, county: 'Tyne and Wear', country: 'United Kingdom', type: 'city' },
      { id: '53.3811,-1.4701', name: 'Sheffield', latitude: 53.3811, longitude: -1.4701, county: 'South Yorkshire', country: 'United Kingdom', type: 'city' },
      
      // University Cities
      { id: '52.2053,0.1218', name: 'Cambridge', latitude: 52.2053, longitude: 0.1218, county: 'Cambridgeshire', country: 'United Kingdom', type: 'city' },
      { id: '51.7520,-1.2577', name: 'Oxford', latitude: 51.7520, longitude: -1.2577, county: 'Oxfordshire', country: 'United Kingdom', type: 'city' },
      { id: '52.9548,-1.1581', name: 'Nottingham', latitude: 52.9548, longitude: -1.1581, county: 'Nottinghamshire', country: 'United Kingdom', type: 'city' },
      { id: '51.3758,-2.3599', name: 'Bath', latitude: 51.3758, longitude: -2.3599, county: 'Somerset', country: 'United Kingdom', type: 'city' },
      
      // Coastal Cities
      { id: '50.8225,-0.1372', name: 'Brighton', latitude: 50.8225, longitude: -0.1372, county: 'East Sussex', country: 'United Kingdom', type: 'city' },
      { id: '50.3755,-4.1427', name: 'Plymouth', latitude: 50.3755, longitude: -4.1427, county: 'Devon', country: 'United Kingdom', type: 'city' },
      { id: '50.7184,-3.5339', name: 'Exeter', latitude: 50.7184, longitude: -3.5339, county: 'Devon', country: 'United Kingdom', type: 'city' },
      { id: '54.5973,-5.9301', name: 'Belfast', latitude: 54.5973, longitude: -5.9301, county: 'Belfast', country: 'Northern Ireland', type: 'city' },
      
      // Cornwall Locations
      { id: '50.1097,-5.5269', name: 'Penzance', latitude: 50.1097, longitude: -5.5269, county: 'Cornwall', country: 'United Kingdom', type: 'town' },
      { id: '50.1503,-5.0875', name: 'Falmouth', latitude: 50.1503, longitude: -5.0875, county: 'Cornwall', country: 'United Kingdom', type: 'town' },
      { id: '50.2632,-5.0510', name: 'Penryn', latitude: 50.2632, longitude: -5.0510, county: 'Cornwall', country: 'United Kingdom', type: 'town' },
      { id: '50.2612,-5.0510', name: 'Truro', latitude: 50.2612, longitude: -5.0510, county: 'Cornwall', country: 'United Kingdom', type: 'city' },
      { id: '50.1036,-5.2725', name: 'Helston', latitude: 50.1036, longitude: -5.2725, county: 'Cornwall', country: 'United Kingdom', type: 'town' },
      { id: '50.4038,-4.6127', name: 'Bodmin', latitude: 50.4038, longitude: -4.6127, county: 'Cornwall', country: 'United Kingdom', type: 'town' },
      { id: '50.5400,-4.4500', name: 'Newquay', latitude: 50.5400, longitude: -4.4500, county: 'Cornwall', country: 'United Kingdom', type: 'town' },
      
      // Towns and Villages
      { id: '51.8860,0.8986', name: 'Canterbury', latitude: 51.8860, longitude: 0.8986, county: 'Kent', country: 'United Kingdom', type: 'city' },
      { id: '52.6309,-1.1097', name: 'Leicester', latitude: 52.6309, longitude: -1.1097, county: 'Leicestershire', country: 'United Kingdom', type: 'city' },
      { id: '51.8790,0.5408', name: 'Colchester', latitude: 51.8790, longitude: 0.5408, county: 'Essex', country: 'United Kingdom', type: 'town' },
      { id: '50.9097,-1.4044', name: 'Southampton', latitude: 50.9097, longitude: -1.4044, county: 'Hampshire', country: 'United Kingdom', type: 'city' },
      { id: '50.8429,-0.8081', name: 'Chichester', latitude: 50.8429, longitude: -0.8081, county: 'West Sussex', country: 'United Kingdom', type: 'city' },
    ];

    let results = [...ukLocations];

    // Add distance if user location provided
    if (userLocation) {
      results = results.map(location => ({
        ...location,
        distance: this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          location.latitude,
          location.longitude
        )
      }));

      // Sort by distance if includeNearby option is set
      if (options.includeNearby) {
        results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }
    }

    // Enhanced fuzzy filter by query if provided
    if (query && query.length > 0) {
      results = results.filter(location => 
        this.fuzzyMatch(query, location.name) ||
        (location.county && this.fuzzyMatch(query, location.county)) ||
        (location.country && this.fuzzyMatch(query, location.country))
      );
    }

    // Sort by popularity if option is set
    if (options.sortByPopularity) {
      const popularityOrder = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Edinburgh', 'Glasgow', 'Liverpool'];
      results.sort((a, b) => {
        const aIndex = popularityOrder.indexOf(a.name);
        const bIndex = popularityOrder.indexOf(b.name);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
      });
    }

    return results;
  }

  async searchLocations(
    query: string, 
    userLocation?: UserLocation, 
    limit: number = 10,
    nearbyMode: boolean = false,
    options: SearchOptions = {}
  ): Promise<LocationSearchResult[]> {
    console.log('Smart search with enhanced features:', { query, nearbyMode, limit, options });
    
    try {
      let results: LocationSearchResult[] = [];

      if (nearbyMode && userLocation) {
        // For nearby mode, get all locations sorted by distance
        results = this.getFallbackLocations(undefined, userLocation, { 
          includeNearby: true, 
          maxDistance: options.maxDistance || 50 
        });
        results = results.filter(result => 
          result.distance !== undefined && result.distance <= (options.maxDistance || 50)
        );
      } else if (query) {
        // For search mode, filter by query with fuzzy matching
        results = this.getFallbackLocations(query, userLocation, { 
          fuzzyMatch: options.fuzzyMatch !== false,
          sortByPopularity: options.sortByPopularity
        });
        
        // Generate suggestions for partial queries
        if (query.length >= 2 && results.length < 3) {
          const suggestions = this.generateSuggestions(query);
          console.log('Generated suggestions:', suggestions);
        }
      } else {
        // Default: show popular locations
        results = this.getFallbackLocations(undefined, userLocation, { 
          sortByPopularity: true 
        });
      }

      // If we have search results and user location, add nearby suggestions
      if (query && !nearbyMode && results.length > 0 && userLocation && options.includeNearby) {
        const firstResult = results[0];
        
        // Add some nearby locations based on the first result
        const nearbyLocations = this.getFallbackLocations(undefined, {
          latitude: firstResult.latitude,
          longitude: firstResult.longitude
        }, { includeNearby: true }).filter(nearby => 
          !results.some(main => main.id === nearby.id) &&
          nearby.distance !== undefined && nearby.distance <= 25
        ).slice(0, 2);

        results.push(...nearbyLocations);
      }

      console.log('Enhanced search results:', results.slice(0, limit));
      return results.slice(0, limit);
      
    } catch (error) {
      console.error('Enhanced location search error:', error);
      // Return some default locations as final fallback
      return this.getFallbackLocations(query, userLocation, { sortByPopularity: true }).slice(0, limit);
    }
  }

  // Get popular/trending locations
  async getPopularLocations(userLocation?: UserLocation, limit: number = 6): Promise<LocationSearchResult[]> {
    return this.getFallbackLocations(undefined, userLocation, { 
      sortByPopularity: true 
    }).slice(0, limit);
  }

  // Get suggestions based on partial input
  async getSuggestions(partialQuery: string, limit: number = 5): Promise<string[]> {
    if (partialQuery.length < 2) return [];
    return this.generateSuggestions(partialQuery).slice(0, limit);
  }
}

export const enhancedLocationService = new EnhancedLocationService();
