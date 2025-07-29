/**
 * Enhanced Theme Toggle Component
 * 
 * A robust theme toggle button with smooth transitions, proper state synchronization,
 * and consistent styling using the centralized color system.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/button';
import { MoonIcon, SunIcon } from '../../components/icons';

interface EnhancedThemeToggleProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  showLabel?: boolean;
  disabled?: boolean;
}

export const EnhancedThemeToggle: React.FC<EnhancedThemeToggleProps> = ({
  className = '',
  size = 'icon',
  variant = 'outline',
  showLabel = false,
  disabled = false
}) => {
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
  const handleToggle = useCallback(async () => {
    if (disabled || isToggling) return;

    setIsToggling(true);
    
    // Immediate visual feedback
    const newMode = !localIsDarkMode;
    setLocalIsDarkMode(newMode);

    try {
      // Small delay to show the transition
      await new Promise(resolve => setTimeout(resolve, 50));
      toggleDarkMode();
    } catch (error) {
      console.error('Theme toggle failed:', error);
      // Revert on error
      setLocalIsDarkMode(!newMode);
    } finally {
      // Reset toggling state
      setTimeout(() => setIsToggling(false), 200);
    }
  }, [disabled, isToggling, localIsDarkMode, toggleDarkMode]);

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={`opacity-0 ${className}`}
        aria-label="Loading theme toggle"
      >
        <div className="w-4 h-4" />
      </Button>
    );
  }

  const buttonContent = (
    <>
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Sun icon (for dark mode - shows sun to indicate switching to light) */}
        <div 
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300 ease-in-out
            ${localIsDarkMode 
              ? 'opacity-100 rotate-0 scale-100 translate-y-0' 
              : 'opacity-0 rotate-180 scale-75 translate-y-1'
            }
          `.trim().replace(/\s+/g, ' ')}
        >
          <SunIcon className="w-4 h-4" />
        </div>
        
        {/* Moon icon (for light mode - shows moon to indicate switching to dark) */}
        <div 
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300 ease-in-out
            ${!localIsDarkMode 
              ? 'opacity-100 rotate-0 scale-100 translate-y-0' 
              : 'opacity-0 -rotate-180 scale-75 -translate-y-1'
            }
          `.trim().replace(/\s+/g, ' ')}
        >
          <MoonIcon className="w-4 h-4" />
        </div>
        
        {/* Loading spinner */}
        {isToggling && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"
              style={{ animationDuration: '0.8s' }}
            />
          </div>
        )}
      </div>
      
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {localIsDarkMode ? 'Light' : 'Dark'} Mode
        </span>
      )}
    </>
  );

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={disabled || isToggling}
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
      {buttonContent}
    </Button>
  );
};

// Export as default theme toggle for backward compatibility
export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  return <EnhancedThemeToggle className={className} />;
};

// Export variants for different use cases
export const ThemeToggleWithLabel: React.FC<{ className?: string }> = ({ className }) => {
  return <EnhancedThemeToggle className={className} showLabel size="default" />;
};

export const ThemeToggleGhost: React.FC<{ className?: string }> = ({ className }) => {
  return <EnhancedThemeToggle className={className} variant="ghost" />;
};

export const ThemeToggleLarge: React.FC<{ className?: string }> = ({ className }) => {
  return <EnhancedThemeToggle className={className} size="lg" />;
};
