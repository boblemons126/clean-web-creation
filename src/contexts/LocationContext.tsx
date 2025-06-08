import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface CustomLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  postcode?: string;
}

interface LocationContextType {
  customLocations: CustomLocation[];
  selectedLocationId: string | null;
  setSelectedLocationId: (id: string | null) => void;
  addCustomLocation: (location: CustomLocation) => void;
  removeCustomLocation: (id: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customLocations, setCustomLocations] = useState<CustomLocation[]>(() => {
    try {
      const storedLocations = localStorage.getItem('customLocations');
      return storedLocations ? JSON.parse(storedLocations) : [];
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return [];
    }
  });

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(() => {
    try {
      const storedId = localStorage.getItem('selectedLocationId');
      return storedId ? JSON.parse(storedId) : null;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return null;
    }
  });

  const addCustomLocation = (location: CustomLocation) => {
    setCustomLocations(prevLocations => {
      // Avoid adding duplicates
      if (prevLocations.some(l => l.id === location.id)) {
        return prevLocations;
      }
      return [...prevLocations, location];
    });
  };

  const removeCustomLocation = (id: string) => {
    setCustomLocations(prevLocations => prevLocations.filter(l => l.id !== id));
    // If the removed location was the selected one, reset to current location
    if (selectedLocationId === id) {
      setSelectedLocationId(null);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('customLocations', JSON.stringify(customLocations));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [customLocations]);

  useEffect(() => {
    try {
      localStorage.setItem('selectedLocationId', JSON.stringify(selectedLocationId));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [selectedLocationId]);

  return (
    <LocationContext.Provider
      value={{
        customLocations,
        selectedLocationId,
        setSelectedLocationId,
        addCustomLocation,
        removeCustomLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
