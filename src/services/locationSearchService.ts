interface LocationResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  state?: string;
  type: 'city' | 'town' | 'postcode' | 'county';
}

const OPENWEATHER_API_KEY = '31fcb172502b94e6534cc6bc72352259';

// Enhanced location search with better partial matching
export const searchLocationsEnhanced = async (
  query: string, 
  userLocation?: { lat: number; lon: number },
  limit = 8
): Promise<LocationResult[]> => {
  if (!query || query.length < 2) return [];

  const results: LocationResult[] = [];
  const cleanQuery = query.trim();
  
  // Strategy 1: Direct search - always try this first
  try {
    const directSearch = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cleanQuery)}&limit=${limit}&appid=${OPENWEATHER_API_KEY}`
    );
    const directData = await directSearch.json();
    
    if (directData?.length) {
      results.push(...directData.map((item: any) => ({
        name: formatLocationName(item),
        latitude: item.lat,
        longitude: item.lon,
        country: item.country,
        state: item.state,
        type: determineLocationType(item, cleanQuery)
      })));
    }
  } catch (error) {
    console.log('Direct search failed:', error);
  }

  // Strategy 2: Add wildcard searches for partial matches
  if (results.length < 5 && cleanQuery.length >= 3) {
    const wildcardQueries = [
      `${cleanQuery}*`,
      `*${cleanQuery}*`,
      `${cleanQuery}%`
    ];

    for (const wildcardQuery of wildcardQueries) {
      try {
        const wildcardSearch = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(wildcardQuery)}&limit=${Math.max(3, limit - results.length)}&appid=${OPENWEATHER_API_KEY}`
        );
        const wildcardData = await wildcardSearch.json();
        
        if (wildcardData?.length) {
          wildcardData.forEach((item: any) => {
            const result = {
              name: formatLocationName(item),
              latitude: item.lat,
              longitude: item.lon,
              country: item.country,
              state: item.state,
              type: determineLocationType(item, cleanQuery)
            };
            
            if (!isDuplicate(results, result) && isRelevantMatch(result.name, cleanQuery)) {
              results.push(result);
            }
          });
        }
      } catch (error) {
        console.log('Wildcard search failed:', error);
      }
      
      if (results.length >= limit) break;
    }
  }

  // Strategy 3: UK-specific search with better variations
  if (results.length < 3) {
    const ukVariations = [
      `${cleanQuery},GB`,
      `${cleanQuery},UK`,
      `${cleanQuery},England`,
      `${cleanQuery},Scotland`, 
      `${cleanQuery},Wales`,
      `${cleanQuery},Cornwall`,
      `${cleanQuery} UK`,
      `${cleanQuery} England`
    ];

    for (const variation of ukVariations) {
      if (results.length >= limit) break;
      
      try {
        const ukSearch = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(variation)}&limit=3&appid=${OPENWEATHER_API_KEY}`
        );
        const ukData = await ukSearch.json();
        
        if (ukData?.length) {
          ukData.forEach((item: any) => {
            const result = {
              name: formatLocationName(item),
              latitude: item.lat,
              longitude: item.lon,
              country: item.country,
              state: item.state,
              type: determineLocationType(item, cleanQuery)
            };
            
            if (!isDuplicate(results, result) && isRelevantMatch(result.name, cleanQuery)) {
              results.push(result);
            }
          });
        }
      } catch (error) {
        console.log('UK variation search failed:', error);
      }
    }
  }

  // Strategy 4: Postcode-specific search
  if (looksLikePostcode(cleanQuery)) {
    const postcodeVariations = [
      cleanQuery.toUpperCase(),
      cleanQuery.toUpperCase().replace(/\s+/g, ''),
      cleanQuery.toUpperCase() + ' ',
      cleanQuery.toLowerCase(),
      `${cleanQuery.toUpperCase()},GB`,
      `${cleanQuery.toUpperCase()},UK`
    ];

    for (const postcodeVar of postcodeVariations) {
      if (results.length >= limit) break;
      
      try {
        const postcodeSearch = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(postcodeVar)}&limit=3&appid=${OPENWEATHER_API_KEY}`
        );
        const postcodeData = await postcodeSearch.json();
        
        if (postcodeData?.length) {
          postcodeData.forEach((item: any) => {
            const result = {
              name: formatLocationName(item),
              latitude: item.lat,
              longitude: item.lon,
              country: item.country,
              state: item.state,
              type: 'postcode' as const
            };
            
            if (!isDuplicate(results, result)) {
              results.push(result);
            }
          });
        }
      } catch (error) {
        console.log('Postcode search failed:', error);
      }
    }
  }

  // Strategy 5: Fuzzy matching for common misspellings and partial words
  if (results.length < 3 && cleanQuery.length >= 3) {
    const fuzzyVariations = generateFuzzyVariations(cleanQuery);
    
    for (const fuzzyQuery of fuzzyVariations) {
      if (results.length >= limit) break;
      
      try {
        const fuzzySearch = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(fuzzyQuery)}&limit=2&appid=${OPENWEATHER_API_KEY}`
        );
        const fuzzyData = await fuzzySearch.json();
        
        if (fuzzyData?.length) {
          fuzzyData.forEach((item: any) => {
            const result = {
              name: formatLocationName(item),
              latitude: item.lat,
              longitude: item.lon,
              country: item.country,
              state: item.state,
              type: determineLocationType(item, cleanQuery)
            };
            
            if (!isDuplicate(results, result) && isRelevantMatch(result.name, cleanQuery)) {
              results.push(result);
            }
          });
        }
      } catch (error) {
        console.log('Fuzzy search failed:', error);
      }
    }
  }

  // Sort results by relevance and proximity
  let sortedResults = results.slice(0, limit);
  
  // Sort by relevance first
  sortedResults.sort((a, b) => {
    const aRelevance = calculateRelevance(a.name, cleanQuery);
    const bRelevance = calculateRelevance(b.name, cleanQuery);
    
    // Boost exact matches and starts with matches
    const aBonus = a.name.toLowerCase().startsWith(cleanQuery.toLowerCase()) ? 0.5 : 0;
    const bBonus = b.name.toLowerCase().startsWith(cleanQuery.toLowerCase()) ? 0.5 : 0;
    
    return (bRelevance + bBonus) - (aRelevance + aBonus);
  });

  // Then sort by proximity if user location is available
  if (userLocation && sortedResults.length > 1) {
    sortedResults.sort((a, b) => {
      const aDistance = calculateDistance(userLocation.lat, userLocation.lon, a.latitude, a.longitude);
      const bDistance = calculateDistance(userLocation.lat, userLocation.lon, b.latitude, b.longitude);
      
      const aRelevance = calculateRelevance(a.name, cleanQuery);
      const bRelevance = calculateRelevance(b.name, cleanQuery);
      
      // Combine relevance with proximity (favor relevance more)
      const aScore = aRelevance * 10 - (aDistance / 100); 
      const bScore = bRelevance * 10 - (bDistance / 100);
      
      return bScore - aScore;
    });
  }

  return sortedResults;
};

const formatLocationName = (item: any): string => {
  const parts = [];
  
  if (item.name) parts.push(item.name);
  if (item.state && item.state !== item.name) parts.push(item.state);
  if (item.country) {
    parts.push(item.country === 'GB' ? 'UK' : item.country);
  }
  
  return parts.join(', ');
};

const determineLocationType = (item: any, query: string): 'city' | 'town' | 'postcode' | 'county' => {
  const queryLower = query.toLowerCase();
  
  // Check if it looks like a postcode
  if (looksLikePostcode(query)) {
    return 'postcode';
  }
  
  const nameLower = item.name?.toLowerCase() || '';
  
  // Check for county indicators
  if (item.state || nameLower.includes('county') || nameLower.includes('shire')) {
    return 'county';
  }
  
  // Default classification based on name length
  return nameLower.length > 8 ? 'city' : 'town';
};

const looksLikePostcode = (query: string): boolean => {
  // UK postcode patterns
  const postcodePattern = /^[a-z]{1,2}\d[a-z\d]?\s*\d?[a-z]{0,2}$/i;
  return postcodePattern.test(query.trim());
};

const generateFuzzyVariations = (query: string): string[] => {
  const variations = [];
  const clean = query.trim().toLowerCase();
  
  // Add common location suffixes for partial matches
  if (clean.length >= 3) {
    variations.push(clean + 'mouth'); // For "Falm" -> "Falmouth" 
    variations.push(clean + 'outh');
    variations.push(clean + 'ton');
    variations.push(clean + 'ham');
    variations.push(clean + 'ford');
    variations.push(clean + 'bury');
    variations.push(clean + 'field');
    variations.push(clean + 'wood');
    variations.push(clean + 'worth');
    variations.push(clean + 'bridge');
  }
  
  // Add UK specific searches
  variations.push(clean + ',Cornwall,GB');
  variations.push(clean + ',Devon,GB');
  variations.push(clean + ',Yorkshire,GB');
  
  return variations.slice(0, 5); // Limit to prevent too many requests
};

const isDuplicate = (results: LocationResult[], newResult: LocationResult): boolean => {
  return results.some(result => 
    Math.abs(result.latitude - newResult.latitude) < 0.01 && 
    Math.abs(result.longitude - newResult.longitude) < 0.01
  );
};

const isRelevantMatch = (resultName: string, query: string): boolean => {
  const queryLower = query.toLowerCase();
  const resultLower = resultName.toLowerCase();
  
  // More lenient matching for partial inputs
  if (queryLower.length <= 3) {
    return resultLower.includes(queryLower) || 
           resultLower.split(/[\s,]+/).some(word => word.startsWith(queryLower));
  }
  
  return calculateRelevance(resultName, query) > 0.2;
};

const calculateRelevance = (resultName: string, query: string): number => {
  const queryLower = query.toLowerCase();
  const resultLower = resultName.toLowerCase();
  
  if (resultLower === queryLower) return 1.0;
  if (resultLower.startsWith(queryLower)) return 0.95;
  
  // Check if any word in the result starts with the query
  const words = resultLower.split(/[\s,]+/);
  for (const word of words) {
    if (word.startsWith(queryLower)) return 0.9;
    if (word === queryLower) return 0.85;
  }
  
  if (resultLower.includes(queryLower)) return 0.7;
  
  // Fuzzy matching for partial words
  if (queryLower.length >= 3) {
    for (const word of words) {
      if (word.includes(queryLower)) return 0.6;
    }
  }
  
  return 0;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
