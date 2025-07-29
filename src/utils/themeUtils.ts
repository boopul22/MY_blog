/**
 * Theme Utilities
 * 
 * Utilities for applying color schemes, generating CSS variables,
 * and managing theme transitions.
 */

import { ColorScheme, getColorScheme } from '../config/colorSchemes';

/**
 * Generate CSS variables string from a color scheme
 */
export const generateCSSVariables = (scheme: ColorScheme): string => {
  const { colors } = scheme;
  
  return `
    --radius: 0.5rem;
    --background: ${colors.background.rgb};
    --foreground: ${colors.foreground.rgb};
    --card: ${colors.card.rgb};
    --card-foreground: ${colors.cardForeground.rgb};
    --popover: ${colors.popover.rgb};
    --popover-foreground: ${colors.popoverForeground.rgb};
    --primary: ${colors.primary.rgb};
    --primary-foreground: ${colors.primaryForeground.rgb};
    --secondary: ${colors.secondary.rgb};
    --secondary-foreground: ${colors.secondaryForeground.rgb};
    --muted: ${colors.muted.rgb};
    --muted-foreground: ${colors.mutedForeground.rgb};
    --accent: ${colors.accent.rgb};
    --accent-foreground: ${colors.accentForeground.rgb};
    --destructive: ${colors.destructive.rgb};
    --destructive-foreground: ${colors.destructiveForeground.rgb};
    --border: ${colors.border.rgb};
    --input: ${colors.input.rgb};
    --ring: ${colors.ring.rgb};
    --chart-1: ${colors.chart1.rgb};
    --chart-2: ${colors.chart2.rgb};
    --chart-3: ${colors.chart3.rgb};
    --chart-4: ${colors.chart4.rgb};
    --chart-5: ${colors.chart5.rgb};
    --sidebar: ${colors.sidebar.rgb};
    --sidebar-foreground: ${colors.sidebarForeground.rgb};
    --sidebar-primary: ${colors.sidebarPrimary.rgb};
    --sidebar-primary-foreground: ${colors.sidebarPrimaryForeground.rgb};
    --sidebar-accent: ${colors.sidebarAccent.rgb};
    --sidebar-accent-foreground: ${colors.sidebarAccentForeground.rgb};
    --sidebar-border: ${colors.sidebarBorder.rgb};
    --sidebar-ring: ${colors.sidebarRing.rgb};
  `.trim();
};

/**
 * Apply a color scheme to the document
 */
export const applyColorScheme = (themeName: string): void => {
  const scheme = getColorScheme(themeName);
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  // Add new theme class
  root.classList.add(scheme.name);
  
  // Apply CSS variables
  const cssVariables = generateCSSVariables(scheme);
  const lines = cssVariables.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && trimmed.includes(':')) {
      const [property, value] = trimmed.split(':').map(s => s.trim());
      if (property.startsWith('--')) {
        root.style.setProperty(property, value.replace(';', ''));
      }
    }
  });
  
  // Update color-scheme property for better browser integration
  root.style.colorScheme = scheme.name;
  
  // Update background color for full coverage
  document.body.style.backgroundColor = `rgb(${scheme.colors.background.rgb})`;
  document.documentElement.style.backgroundColor = `rgb(${scheme.colors.background.rgb})`;
};

/**
 * Get current theme from localStorage or default
 */
export const getCurrentTheme = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('theme') || 'light';
  }
  return 'light';
};

/**
 * Save theme to localStorage
 */
export const saveTheme = (themeName: string): void => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('theme', themeName);
  }
};

/**
 * Initialize theme on app startup
 */
export const initializeTheme = (): void => {
  const savedTheme = getCurrentTheme();
  applyColorScheme(savedTheme);
};

/**
 * Switch to a new theme
 */
export const switchTheme = (themeName: string): void => {
  applyColorScheme(themeName);
  saveTheme(themeName);
};

/**
 * Toggle between light and dark themes
 */
export const toggleTheme = (): string => {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  switchTheme(newTheme);
  return newTheme;
};

/**
 * Generate Tailwind color configuration from color schemes
 */
export const generateTailwindColors = (): Record<string, string> => {
  const lightScheme = getColorScheme('light');
  
  return {
    // Use CSS variables for Tailwind colors to ensure consistency
    background: 'rgb(var(--background))',
    foreground: 'rgb(var(--foreground))',
    card: 'rgb(var(--card))',
    'card-foreground': 'rgb(var(--card-foreground))',
    popover: 'rgb(var(--popover))',
    'popover-foreground': 'rgb(var(--popover-foreground))',
    primary: 'rgb(var(--primary))',
    'primary-foreground': 'rgb(var(--primary-foreground))',
    secondary: 'rgb(var(--secondary))',
    'secondary-foreground': 'rgb(var(--secondary-foreground))',
    muted: 'rgb(var(--muted))',
    'muted-foreground': 'rgb(var(--muted-foreground))',
    accent: 'rgb(var(--accent))',
    'accent-foreground': 'rgb(var(--accent-foreground))',
    destructive: 'rgb(var(--destructive))',
    'destructive-foreground': 'rgb(var(--destructive-foreground))',
    border: 'rgb(var(--border))',
    input: 'rgb(var(--input))',
    ring: 'rgb(var(--ring))',
    
    // Legacy color names for backward compatibility
    'primary-dark': lightScheme.colors.primaryDark.hex,
    'accent-dark': lightScheme.colors.accentDark.hex,
    light: lightScheme.colors.light.hex,
    dark: lightScheme.colors.dark.hex,
    'medium-dark': lightScheme.colors.mediumDark.hex,
    'light-dark': lightScheme.colors.lightDark.hex,
    'dark-text': lightScheme.colors.darkText.hex,
    'light-text': lightScheme.colors.lightText.hex,
  };
};

/**
 * Create CSS custom properties for focus and accessibility colors
 */
export const generateAccessibilityColors = (scheme: ColorScheme): Record<string, string> => {
  return {
    '--focus-ring': scheme.colors.ring.rgb,
    '--focus-ring-offset': scheme.colors.background.rgb,
    '--selection-bg': scheme.colors.accent.rgb,
    '--selection-text': scheme.colors.accentForeground.rgb,
    '--high-contrast-outline': scheme.name === 'dark' ? '255 255 255' : '0 0 0',
    '--high-contrast-bg': scheme.name === 'dark' ? '0 0 0' : '255 255 0',
    '--high-contrast-text': scheme.name === 'dark' ? '255 255 255' : '0 0 0',
  };
};
