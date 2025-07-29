/**
 * Theme Test Component
 * 
 * A component for testing and demonstrating the centralized color system
 */

import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/button';
import { ThemeToggle, ThemeButtons, ThemeDropdown } from './ThemeSelector';

export const ThemeTest: React.FC = () => {
  const { currentTheme, isDarkMode, availableThemes } = useTheme();

  return (
    <div className="p-8 space-y-8 bg-background text-foreground min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Theme System Test
        </h1>
        <p className="text-muted-foreground mb-8">
          Testing the centralized color system with various components and themes.
        </p>

        {/* Theme Information */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Theme Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Theme:</strong> {currentTheme}
            </div>
            <div>
              <strong>Mode:</strong> {isDarkMode ? 'Dark' : 'Light'}
            </div>
            <div>
              <strong>Available:</strong> {availableThemes.join(', ')}
            </div>
          </div>
        </div>

        {/* Theme Selectors */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border mb-8">
          <h2 className="text-xl font-semibold mb-4">Theme Selectors</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Toggle Button:</h3>
              <ThemeToggle />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Theme Buttons:</h3>
              <ThemeButtons showLabels={true} />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Theme Dropdown:</h3>
              <ThemeDropdown showLabels={true} />
            </div>
          </div>
        </div>

        {/* Color Palette Display */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border mb-8">
          <h2 className="text-xl font-semibold mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch name="Background" className="bg-background border-2 border-foreground" />
            <ColorSwatch name="Foreground" className="bg-foreground" />
            <ColorSwatch name="Primary" className="bg-primary" />
            <ColorSwatch name="Secondary" className="bg-secondary" />
            <ColorSwatch name="Accent" className="bg-accent" />
            <ColorSwatch name="Muted" className="bg-muted border border-border" />
            <ColorSwatch name="Destructive" className="bg-destructive" />
            <ColorSwatch name="Border" className="bg-border" />
          </div>
        </div>

        {/* Component Examples */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border mb-8">
          <h2 className="text-xl font-semibold mb-4">Component Examples</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </div>
            
            <div className="p-4 bg-muted rounded-md">
              <p className="text-muted-foreground">
                This is muted content with muted foreground text.
              </p>
            </div>
            
            <div className="border border-border rounded-md p-4">
              <p className="text-foreground">
                This content has a border using the centralized border color.
              </p>
            </div>
          </div>
        </div>

        {/* CSS Variables Display */}
        <div className="bg-card text-card-foreground p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4">CSS Variables (Current Values)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
            <CSSVariableDisplay name="--background" />
            <CSSVariableDisplay name="--foreground" />
            <CSSVariableDisplay name="--primary" />
            <CSSVariableDisplay name="--secondary" />
            <CSSVariableDisplay name="--accent" />
            <CSSVariableDisplay name="--muted" />
            <CSSVariableDisplay name="--border" />
            <CSSVariableDisplay name="--destructive" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for displaying color swatches
const ColorSwatch: React.FC<{ name: string; className: string }> = ({ name, className }) => (
  <div className="text-center">
    <div className={`w-full h-16 rounded-md ${className} mb-2`}></div>
    <p className="text-xs text-muted-foreground">{name}</p>
  </div>
);

// Helper component for displaying CSS variable values
const CSSVariableDisplay: React.FC<{ name: string }> = ({ name }) => {
  const [value, setValue] = React.useState<string>('');

  React.useEffect(() => {
    const updateValue = () => {
      const computedValue = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      setValue(computedValue || 'Not set');
    };

    updateValue();
    // Update when theme changes
    const observer = new MutationObserver(updateValue);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => observer.disconnect();
  }, [name]);

  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{name}:</span>
      <span>{value}</span>
    </div>
  );
};
