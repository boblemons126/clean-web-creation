
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CustomLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  county?: string;
  country?: string;
  postcode?: string;
  type?: 'city' | 'town' | 'village' | 'postcode' | 'county';
}

interface LocationContextType {
  customLocations: CustomLocation[];
  selectedLocationId: string | null;
  favoriteLocations: string[];
  addCustomLocation: (location: CustomLocation) => void;
  removeCustomLocation: (id: string) => void;
  setSelectedLocationId: (id: string | null) => void;
  toggleFavoriteLocation: (id: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [customLocations, setCustomLocations] = useState<CustomLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [favoriteLocations, setFavoriteLocations] = useState<string[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedLocations = localStorage.getItem('customLocations');
    const storedSelected = localStorage.getItem('selectedLocationId');
    const storedFavorites = localStorage.getItem('favoriteLocations');
    
    if (storedLocations) {
      try {
        setCustomLocations(JSON.parse(storedLocations));
      } catch (error) {
        console.error('Failed to parse stored locations:', error);
      }
    }
    
    if (storedSelected) {
      setSelectedLocationId(storedSelected);
    }

    if (storedFavorites) {
      try {
        setFavoriteLocations(JSON.parse(storedFavorites));
      } catch (error) {
        console.error('Failed to parse stored favorites:', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('customLocations', JSON.stringify(customLocations));
  }, [customLocations]);

  useEffect(() => {
    if (selectedLocationId) {
      localStorage.setItem('selectedLocationId', selectedLocationId);
    } else {
      localStorage.removeItem('selectedLocationId');
    }
  }, [selectedLocationId]);

  useEffect(() => {
    localStorage.setItem('favoriteLocations', JSON.stringify(favoriteLocations));
  }, [favoriteLocations]);

  const addCustomLocation = (location: CustomLocation) => {
    setCustomLocations(prev => {
      const exists = prev.find(loc => loc.id === location.id);
      if (exists) return prev;
      return [...prev, location];
    });
  };

  const removeCustomLocation = (id: string) => {
    setCustomLocations(prev => prev.filter(loc => loc.id !== id));
    setFavoriteLocations(prev => prev.filter(favId => favId !== id));
    if (selectedLocationId === id) {
      setSelectedLocationId(null);
    }
  };

  const toggleFavoriteLocation = (id: string) => {
    setFavoriteLocations(prev => {
      if (prev.includes(id)) {
        return prev.filter(favId => favId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <LocationContext.Provider value={{
      customLocations,
      selectedLocationId,
      favoriteLocations,
      addCustomLocation,
      removeCustomLocation,
      setSelectedLocationId,
      toggleFavoriteLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
