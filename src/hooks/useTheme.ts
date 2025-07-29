/**
 * Theme Hook
 * 
 * Custom hook for managing theme state and providing theme utilities
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  getCurrentTheme, 
  switchTheme, 
  toggleTheme as toggleThemeUtil,
  initializeTheme,
  applyColorScheme 
} from '../utils/themeUtils';
import { getAvailableThemes, getThemeDisplayNames } from '../config/colorSchemes';

export interface UseThemeReturn {
  currentTheme: string;
  isDarkMode: boolean;
  availableThemes: string[];
  themeDisplayNames: Record<string, string>;
  switchToTheme: (themeName: string) => void;
  toggleDarkMode: () => void;
  initTheme: () => void;
}

/**
 * Custom hook for theme management
 */
export const useTheme = (): UseThemeReturn => {
  const [currentTheme, setCurrentTheme] = useState<string>(() => getCurrentTheme());

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, []);

  // Listen for theme changes from other sources (e.g., system preference changes)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        setCurrentTheme(e.newValue);
        applyColorScheme(e.newValue);
      }
    };

    // Listen for theme changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Listen for DOM class changes (in case theme is changed externally)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const root = document.documentElement;
          const isDark = root.classList.contains('dark');
          const isLight = root.classList.contains('light');

          if (isDark && currentTheme !== 'dark') {
            setCurrentTheme('dark');
          } else if (isLight && currentTheme !== 'light') {
            setCurrentTheme('light');
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      observer.disconnect();
    };
  }, [currentTheme]);

  // Update theme state when it changes
  const handleThemeChange = useCallback((newTheme: string) => {
    setCurrentTheme(newTheme);
    switchTheme(newTheme);
  }, []);

  // Toggle between light and dark modes with immediate state update
  const toggleDarkMode = useCallback(() => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme); // Update state immediately
    switchTheme(newTheme);
  }, [currentTheme]);

  // Switch to a specific theme
  const switchToTheme = useCallback((themeName: string) => {
    handleThemeChange(themeName);
  }, [handleThemeChange]);

  // Initialize theme (useful for manual initialization)
  const initTheme = useCallback(() => {
    const savedTheme = getCurrentTheme();
    applyColorScheme(savedTheme);
    setCurrentTheme(savedTheme);
  }, []);

  return {
    currentTheme,
    isDarkMode: currentTheme === 'dark',
    availableThemes: getAvailableThemes(),
    themeDisplayNames: getThemeDisplayNames(),
    switchToTheme,
    toggleDarkMode,
    initTheme,
  };
};
