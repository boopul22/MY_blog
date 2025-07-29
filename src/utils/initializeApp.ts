/**
 * Application Initialization
 * 
 * Handles app startup tasks including theme initialization
 */

import { initializeTheme } from './themeUtils';

/**
 * Initialize the application
 * Call this function when the app starts to set up all necessary systems
 */
export const initializeApp = (): void => {
  // Initialize the theme system
  initializeTheme();
  
  // Add any other initialization tasks here
  console.log('🎨 Theme system initialized');
};

/**
 * Initialize theme system specifically
 * This can be called separately if needed
 */
export const initTheme = (): void => {
  initializeTheme();
};
