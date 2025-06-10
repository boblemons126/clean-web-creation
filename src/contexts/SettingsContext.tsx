import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WidgetSettings {
  id: string;
  enabled: boolean;
  position: number;
  size?: 'small' | 'medium' | 'large';
  config?: Record<string, any>;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto' | 'contrast';
  accentColor: string;
  backgroundOpacity: number;
  animationsEnabled: boolean;
  blurEffects: boolean;
}

export interface LayoutSettings {
  layoutType: 'grid' | 'masonry' | 'columns' | 'rows';
  gridColumns: number;
  spacing: number;
  responsiveLayout: boolean;
  fixedWidgetSizes: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
}

export interface DataSettings {
  dataRetention: number;
  analytics: boolean;
  location: boolean;
  cookies: boolean;
}

export interface Settings {
  widgets: WidgetSettings[];
  appearance: AppearanceSettings;
  layout: LayoutSettings;
  notifications: NotificationSettings;
  data: DataSettings;
}

interface SettingsContextType {
  settings: Settings;
  updateWidgetSettings: (widgets: WidgetSettings[]) => void;
  updateAppearanceSettings: (appearance: Partial<AppearanceSettings>) => void;
  updateLayoutSettings: (layout: Partial<LayoutSettings>) => void;
  updateNotificationSettings: (notifications: Partial<NotificationSettings>) => void;
  updateDataSettings: (data: Partial<DataSettings>) => void;
  saveSettings: () => void;
  resetSettings: () => void;
  hasUnsavedChanges: boolean;
}

export interface WeatherSource {
  id: string;
  name: string;
  url: string;
  isPrimary?: boolean;
  apiKey?: string;
}

const defaultSettings: Settings = {
  widgets: [
    { 
      id: 'weather', 
      enabled: true, 
      position: 0,
      config: { 
        useDynamicColoring: true,
        weatherSources: [
          { id: 'openweathermap', name: 'OpenWeatherMap', url: 'api.openweathermap.org', isPrimary: true },
          { id: 'weatherapi', name: 'WeatherAPI', url: 'api.weatherapi.com' }
        ]
      }
    },
    { id: 'calendar', enabled: true, position: 1 },
    { id: 'news', enabled: true, position: 2 },
    { id: 'time', enabled: true, position: 3 },
    { id: 'traffic', enabled: false, position: 4 },
    { id: 'stocks', enabled: false, position: 5 }
  ],
  appearance: {
    theme: 'dark',
    accentColor: 'blue',
    backgroundOpacity: 80,
    animationsEnabled: true,
    blurEffects: true
  },
  layout: {
    layoutType: 'grid',
    gridColumns: 4,
    spacing: 6,
    responsiveLayout: true,
    fixedWidgetSizes: false
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    soundEnabled: true,
    frequency: 'hourly'
  },
  data: {
    dataRetention: 30,
    analytics: false,
    location: true,
    cookies: true
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboard-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Ensure the weather widget has the useDynamicColoring setting and default weather sources
        const updatedWidgets = parsed.widgets.map((widget: WidgetSettings) => {
          if (widget.id === 'weather') {
            const weatherConfig = widget.config || {};
            return {
              ...widget,
              config: { 
                ...weatherConfig, 
                useDynamicColoring: weatherConfig.hasOwnProperty('useDynamicColoring') ? weatherConfig.useDynamicColoring : true,
                weatherSources: weatherConfig.weatherSources || [
                  { id: 'openweathermap', name: 'OpenWeatherMap', url: 'api.openweathermap.org', isPrimary: true },
                  { id: 'weatherapi', name: 'WeatherAPI', url: 'api.weatherapi.com' }
                ]
              }
            };
          }
          return widget;
        });
        setSettings({ ...parsed, widgets: updatedWidgets });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  const updateWidgetSettings = (widgets: WidgetSettings[]) => {
    setSettings(prev => ({ ...prev, widgets }));
    setHasUnsavedChanges(true);
  };

  const updateAppearanceSettings = (appearance: Partial<AppearanceSettings>) => {
    setSettings(prev => ({ 
      ...prev, 
      appearance: { ...prev.appearance, ...appearance }
    }));
    setHasUnsavedChanges(true);
  };

  const updateLayoutSettings = (layout: Partial<LayoutSettings>) => {
    setSettings(prev => ({ 
      ...prev, 
      layout: { ...prev.layout, ...layout }
    }));
    setHasUnsavedChanges(true);
  };

  const updateNotificationSettings = (notifications: Partial<NotificationSettings>) => {
    setSettings(prev => ({ 
      ...prev, 
      notifications: { ...prev.notifications, ...notifications }
    }));
    setHasUnsavedChanges(true);
  };

  const updateDataSettings = (data: Partial<DataSettings>) => {
    setSettings(prev => ({ 
      ...prev, 
      data: { ...prev.data, ...data }
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem('dashboard-settings', JSON.stringify(settings));
    setHasUnsavedChanges(false);
    console.log('Settings saved successfully');
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('dashboard-settings');
    setHasUnsavedChanges(false);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateWidgetSettings,
        updateAppearanceSettings,
        updateLayoutSettings,
        updateNotificationSettings,
        updateDataSettings,
        saveSettings,
        resetSettings,
        hasUnsavedChanges
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
