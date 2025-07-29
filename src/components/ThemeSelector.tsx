/**
 * Theme Selector Component
 *
 * A component for selecting and switching between different color themes
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/button';
import { MoonIcon, SunIcon } from '../../components/icons';

interface ThemeSelectorProps {
  className?: string;
  showLabels?: boolean;
  variant?: 'button' | 'dropdown' | 'toggle';
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = '',
  showLabels = false,
  variant = 'toggle'
}) => {
  const {
    currentTheme,
    isDarkMode,
    availableThemes,
    themeDisplayNames,
    switchToTheme,
    toggleDarkMode
  } = useTheme();

  // Local state to handle immediate visual feedback
  const [isToggling, setIsToggling] = useState(false);
  const [localIsDarkMode, setLocalIsDarkMode] = useState(isDarkMode);

  // Sync local state with theme context
  useEffect(() => {
    setLocalIsDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Enhanced toggle handler with immediate feedback
  const handleToggle = async () => {
    setIsToggling(true);
    setLocalIsDarkMode(!localIsDarkMode); // Immediate visual feedback

    try {
      toggleDarkMode();
    } catch (error) {
      console.error('Theme toggle failed:', error);
      // Revert local state if toggle fails
      setLocalIsDarkMode(localIsDarkMode);
    } finally {
      // Reset toggling state after a short delay
      setTimeout(() => setIsToggling(false), 150);
    }
  };

  if (variant === 'toggle') {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleToggle}
        disabled={isToggling}
        className={`
          relative overflow-hidden transition-all duration-200 ease-in-out
          border-border bg-background text-foreground
          hover:bg-accent hover:text-accent-foreground
          focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        aria-label={`Switch to ${localIsDarkMode ? 'light' : 'dark'} mode`}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          {/* Icon transition container */}
          <div
            className={`
              absolute inset-0 flex items-center justify-center
              transition-all duration-200 ease-in-out
              ${localIsDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-75'}
            `.trim().replace(/\s+/g, ' ')}
          >
            <SunIcon className="w-4 h-4" />
          </div>
          <div
            className={`
              absolute inset-0 flex items-center justify-center
              transition-all duration-200 ease-in-out
              ${!localIsDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}
            `.trim().replace(/\s+/g, ' ')}
          >
            <MoonIcon className="w-4 h-4" />
          </div>
        </div>

        {/* Loading indicator */}
        {isToggling && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="w-2 h-2 border border-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </Button>
    );
  }

  if (variant === 'button') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {availableThemes.map((theme) => (
          <Button
            key={theme}
            variant={currentTheme === theme ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchToTheme(theme)}
            className="capitalize"
          >
            {showLabels ? themeDisplayNames[theme] : theme}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <select
          value={currentTheme}
          onChange={(e) => switchToTheme(e.target.value)}
          className="bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
          aria-label="Select theme"
        >
          {availableThemes.map((theme) => (
            <option key={theme} value={theme}>
              {showLabels ? themeDisplayNames[theme] : theme}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
};

/**
 * Enhanced Theme Toggle with improved UX
 */
const EnhancedThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentTheme, isDarkMode, toggleDarkMode } = useTheme();

  // Local state for immediate visual feedback
  const [isToggling, setIsToggling] = useState(false);
  const [localIsDarkMode, setLocalIsDarkMode] = useState(isDarkMode);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync local state with theme context
  useEffect(() => {
    if (mounted) {
      setLocalIsDarkMode(isDarkMode);
    }
  }, [isDarkMode, mounted]);

  // Enhanced toggle handler
  const handleToggle = async () => {
    if (isToggling) return;

    setIsToggling(true);
    setLocalIsDarkMode(!localIsDarkMode); // Immediate visual feedback

    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      toggleDarkMode();
    } catch (error) {
      console.error('Theme toggle failed:', error);
      setLocalIsDarkMode(localIsDarkMode); // Revert on error
    } finally {
      setTimeout(() => setIsToggling(false), 200);
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        className={`opacity-0 ${className}`}
        aria-label="Loading theme toggle"
      >
        <div className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      disabled={isToggling}
      className={`
        relative transition-all duration-200 ease-in-out
        border-border bg-background text-foreground
        hover:bg-accent hover:text-accent-foreground
        focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isToggling ? 'scale-95' : 'scale-100'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      aria-label={`Switch to ${localIsDarkMode ? 'light' : 'dark'} mode`}
      aria-pressed={localIsDarkMode}
      title={`Current: ${localIsDarkMode ? 'Dark' : 'Light'} mode. Click to switch.`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Sun icon (for dark mode) */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300 ease-in-out
            ${localIsDarkMode
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-180 scale-75'
            }
          `.trim().replace(/\s+/g, ' ')}
        >
          <SunIcon className="w-4 h-4" />
        </div>

        {/* Moon icon (for light mode) */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300 ease-in-out
            ${!localIsDarkMode
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-180 scale-75'
            }
          `.trim().replace(/\s+/g, ' ')}
        >
          <MoonIcon className="w-4 h-4" />
        </div>

        {/* Loading spinner */}
        {isToggling && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60" />
          </div>
        )}
      </div>
    </Button>
  );
};

/**
 * Legacy Theme Toggle Button (for backward compatibility)
 */
export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  return <EnhancedThemeToggle className={className} />;
};

/**
 * Theme Buttons (for selecting specific themes)
 */
export const ThemeButtons: React.FC<{ className?: string; showLabels?: boolean }> = ({ 
  className, 
  showLabels = true 
}) => {
  return <ThemeSelector variant="button" className={className} showLabels={showLabels} />;
};

/**
 * Theme Dropdown (for compact theme selection)
 */
export const ThemeDropdown: React.FC<{ className?: string; showLabels?: boolean }> = ({ 
  className, 
  showLabels = true 
}) => {
  return <ThemeSelector variant="dropdown" className={className} showLabels={showLabels} />;
};
