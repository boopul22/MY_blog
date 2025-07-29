/**
 * Centralized Color Scheme Configuration
 * 
 * This file serves as the single source of truth for all color definitions
 * across the application. It supports multiple themes and provides utilities
 * for easy theme switching and future color scheme modifications.
 */

// Color value type - supports both hex and RGB formats
export interface ColorValue {
  hex: string;
  rgb: string; // Space-separated RGB values for CSS variables (e.g., "255 255 255")
}

// Individual color scheme definition
export interface ColorScheme {
  name: string;
  displayName: string;
  colors: {
    // Core background and text colors
    background: ColorValue;
    foreground: ColorValue;
    
    // Card and surface colors
    card: ColorValue;
    cardForeground: ColorValue;
    
    // Popover colors
    popover: ColorValue;
    popoverForeground: ColorValue;
    
    // Primary brand colors
    primary: ColorValue;
    primaryForeground: ColorValue;
    primaryDark: ColorValue; // For hover states
    
    // Secondary colors
    secondary: ColorValue;
    secondaryForeground: ColorValue;
    
    // Muted colors for subtle elements
    muted: ColorValue;
    mutedForeground: ColorValue;
    
    // Accent colors for highlights
    accent: ColorValue;
    accentForeground: ColorValue;
    accentDark: ColorValue; // For hover states
    
    // Destructive/error colors
    destructive: ColorValue;
    destructiveForeground: ColorValue;
    
    // Border and input colors
    border: ColorValue;
    input: ColorValue;
    ring: ColorValue; // Focus ring color
    
    // Chart colors
    chart1: ColorValue;
    chart2: ColorValue;
    chart3: ColorValue;
    chart4: ColorValue;
    chart5: ColorValue;
    
    // Sidebar colors
    sidebar: ColorValue;
    sidebarForeground: ColorValue;
    sidebarPrimary: ColorValue;
    sidebarPrimaryForeground: ColorValue;
    sidebarAccent: ColorValue;
    sidebarAccentForeground: ColorValue;
    sidebarBorder: ColorValue;
    sidebarRing: ColorValue;
    
    // Additional semantic colors
    light: ColorValue;
    dark: ColorValue;
    mediumDark: ColorValue;
    lightDark: ColorValue;
    darkText: ColorValue;
    lightText: ColorValue;
  };
}

// Utility function to create ColorValue objects
const createColor = (hex: string): ColorValue => {
  // Convert hex to RGB values
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  return {
    hex,
    rgb: `${r} ${g} ${b}`
  };
};

// Light theme color scheme
export const lightTheme: ColorScheme = {
  name: 'light',
  displayName: 'Light Theme',
  colors: {
    background: createColor('#f8f9fa'),
    foreground: createColor('#1a202c'),
    
    card: createColor('#ffffff'),
    cardForeground: createColor('#1a202c'),
    
    popover: createColor('#ffffff'),
    popoverForeground: createColor('#1a202c'),
    
    primary: createColor('#007bff'),
    primaryForeground: createColor('#f7fafc'),
    primaryDark: createColor('#0056b3'),
    
    secondary: createColor('#6c757d'),
    secondaryForeground: createColor('#1a202c'),
    
    muted: createColor('#f8f9fa'),
    mutedForeground: createColor('#6c757d'),
    
    accent: createColor('#ca4246'),
    accentForeground: createColor('#f7fafc'),
    accentDark: createColor('#b23438'),
    
    destructive: createColor('#dc2626'),
    destructiveForeground: createColor('#f8f9fa'),
    
    border: createColor('#e5e7eb'),
    input: createColor('#e5e7eb'),
    ring: createColor('#007bff'),
    
    chart1: createColor('#007bff'),
    chart2: createColor('#ca4246'),
    chart3: createColor('#6c757d'),
    chart4: createColor('#22c55e'),
    chart5: createColor('#a855f7'),
    
    sidebar: createColor('#1a202c'),
    sidebarForeground: createColor('#f7fafc'),
    sidebarPrimary: createColor('#007bff'),
    sidebarPrimaryForeground: createColor('#f7fafc'),
    sidebarAccent: createColor('#2d3748'),
    sidebarAccentForeground: createColor('#f7fafc'),
    sidebarBorder: createColor('#4a5568'),
    sidebarRing: createColor('#007bff'),
    
    light: createColor('#f8f9fa'),
    dark: createColor('#1a202c'),
    mediumDark: createColor('#2d3748'),
    lightDark: createColor('#4a5568'),
    darkText: createColor('#1a202c'),
    lightText: createColor('#f7fafc'),
  }
};

// Dark theme color scheme
export const darkTheme: ColorScheme = {
  name: 'dark',
  displayName: 'Dark Theme',
  colors: {
    background: createColor('#1a202c'),
    foreground: createColor('#f7fafc'),
    
    card: createColor('#2d3748'),
    cardForeground: createColor('#f7fafc'),
    
    popover: createColor('#2d3748'),
    popoverForeground: createColor('#f7fafc'),
    
    primary: createColor('#007bff'),
    primaryForeground: createColor('#f7fafc'),
    primaryDark: createColor('#0056b3'),
    
    secondary: createColor('#4a5568'),
    secondaryForeground: createColor('#f7fafc'),
    
    muted: createColor('#2d3748'),
    mutedForeground: createColor('#9ca3af'),
    
    accent: createColor('#ca4246'),
    accentForeground: createColor('#f7fafc'),
    accentDark: createColor('#b23438'),
    
    destructive: createColor('#ef4444'),
    destructiveForeground: createColor('#f7fafc'),
    
    border: createColor('#4a5568'),
    input: createColor('#4a5568'),
    ring: createColor('#007bff'),
    
    chart1: createColor('#007bff'),
    chart2: createColor('#ca4246'),
    chart3: createColor('#6c757d'),
    chart4: createColor('#22c55e'),
    chart5: createColor('#a855f7'),
    
    sidebar: createColor('#1a202c'),
    sidebarForeground: createColor('#f7fafc'),
    sidebarPrimary: createColor('#007bff'),
    sidebarPrimaryForeground: createColor('#f7fafc'),
    sidebarAccent: createColor('#2d3748'),
    sidebarAccentForeground: createColor('#f7fafc'),
    sidebarBorder: createColor('#4a5568'),
    sidebarRing: createColor('#007bff'),
    
    light: createColor('#f8f9fa'),
    dark: createColor('#1a202c'),
    mediumDark: createColor('#2d3748'),
    lightDark: createColor('#4a5568'),
    darkText: createColor('#1a202c'),
    lightText: createColor('#f7fafc'),
  }
};

// Example: Blue theme (demonstrates how to add new themes)
export const blueTheme: ColorScheme = {
  name: 'blue',
  displayName: 'Blue Theme',
  colors: {
    background: createColor('#f0f9ff'),
    foreground: createColor('#0c4a6e'),

    card: createColor('#ffffff'),
    cardForeground: createColor('#0c4a6e'),

    popover: createColor('#ffffff'),
    popoverForeground: createColor('#0c4a6e'),

    primary: createColor('#0284c7'),
    primaryForeground: createColor('#f0f9ff'),
    primaryDark: createColor('#0369a1'),

    secondary: createColor('#64748b'),
    secondaryForeground: createColor('#0c4a6e'),

    muted: createColor('#f1f5f9'),
    mutedForeground: createColor('#64748b'),

    accent: createColor('#0ea5e9'),
    accentForeground: createColor('#f0f9ff'),
    accentDark: createColor('#0284c7'),

    destructive: createColor('#dc2626'),
    destructiveForeground: createColor('#f0f9ff'),

    border: createColor('#cbd5e1'),
    input: createColor('#cbd5e1'),
    ring: createColor('#0284c7'),

    chart1: createColor('#0284c7'),
    chart2: createColor('#0ea5e9'),
    chart3: createColor('#64748b'),
    chart4: createColor('#22c55e'),
    chart5: createColor('#a855f7'),

    sidebar: createColor('#0c4a6e'),
    sidebarForeground: createColor('#f0f9ff'),
    sidebarPrimary: createColor('#0284c7'),
    sidebarPrimaryForeground: createColor('#f0f9ff'),
    sidebarAccent: createColor('#075985'),
    sidebarAccentForeground: createColor('#f0f9ff'),
    sidebarBorder: createColor('#0369a1'),
    sidebarRing: createColor('#0284c7'),

    light: createColor('#f0f9ff'),
    dark: createColor('#0c4a6e'),
    mediumDark: createColor('#075985'),
    lightDark: createColor('#0369a1'),
    darkText: createColor('#0c4a6e'),
    lightText: createColor('#f0f9ff'),
  }
};

// Available color schemes
export const colorSchemes: Record<string, ColorScheme> = {
  light: lightTheme,
  dark: darkTheme,
  // blue: blueTheme, // Uncomment to enable blue theme
};

// Default theme
export const defaultTheme = 'light';

// Utility functions for theme management
export const getColorScheme = (themeName: string): ColorScheme => {
  return colorSchemes[themeName] || colorSchemes[defaultTheme];
};

export const getAvailableThemes = (): string[] => {
  return Object.keys(colorSchemes);
};

export const getThemeDisplayNames = (): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(colorSchemes).map(([key, scheme]) => [key, scheme.displayName])
  );
};
