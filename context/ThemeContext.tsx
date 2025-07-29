import React, { createContext, useContext } from 'react';
import { useTheme as useThemeHook, UseThemeReturn } from '../src/hooks/useTheme';

// Extended interface that includes all theme functionality
interface ThemeContextType extends UseThemeReturn {
  // Legacy compatibility
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeHook = useThemeHook();

  // Create the context value with both new and legacy APIs
  const contextValue: ThemeContextType = {
    ...themeHook,
    // Legacy compatibility - these are already provided by the hook
    isDarkMode: themeHook.isDarkMode,
    toggleDarkMode: themeHook.toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};