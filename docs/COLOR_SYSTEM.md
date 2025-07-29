# Centralized Color System Documentation

## Overview

This blog application now uses a centralized color system that provides:
- **Single source of truth** for all color definitions
- **Easy theme switching** between light/dark modes
- **Extensible system** for adding new color schemes
- **Consistent theming** across all components
- **Future-proof architecture** for easy color scheme changes

## Architecture

### Core Files

1. **`src/config/colorSchemes.ts`** - Defines all color schemes
2. **`src/utils/themeUtils.ts`** - Theme management utilities
3. **`src/hooks/useTheme.ts`** - React hook for theme management
4. **`context/ThemeContext.tsx`** - React context provider (updated)
5. **`src/components/ThemeSelector.tsx`** - Theme selection components

### CSS Integration

- **`index.css`** - Contains CSS variables that are dynamically updated
- **`tailwind.config.js`** - Updated to use CSS variables for consistency

## Usage

### Basic Theme Toggle

```tsx
import { ThemeToggle } from '../src/components/ThemeSelector';

function Header() {
  return (
    <div>
      <ThemeToggle />
    </div>
  );
}
```

### Advanced Theme Selection

```tsx
import { ThemeButtons, ThemeDropdown } from '../src/components/ThemeSelector';

function Settings() {
  return (
    <div>
      {/* Button-based theme selection */}
      <ThemeButtons showLabels={true} />
      
      {/* Dropdown theme selection */}
      <ThemeDropdown showLabels={true} />
    </div>
  );
}
```

### Using the Theme Hook

```tsx
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { 
    currentTheme, 
    isDarkMode, 
    availableThemes, 
    switchToTheme, 
    toggleDarkMode 
  } = useTheme();

  return (
    <div>
      <p>Current theme: {currentTheme}</p>
      <button onClick={toggleDarkMode}>
        Switch to {isDarkMode ? 'light' : 'dark'} mode
      </button>
    </div>
  );
}
```

## Adding New Color Schemes

### Step 1: Define the Color Scheme

Add a new color scheme in `src/config/colorSchemes.ts`:

```typescript
export const greenTheme: ColorScheme = {
  name: 'green',
  displayName: 'Green Theme',
  colors: {
    background: createColor('#f0fdf4'),
    foreground: createColor('#14532d'),
    primary: createColor('#16a34a'),
    // ... define all required colors
  }
};
```

### Step 2: Register the Theme

Add it to the `colorSchemes` object:

```typescript
export const colorSchemes: Record<string, ColorScheme> = {
  light: lightTheme,
  dark: darkTheme,
  green: greenTheme, // Add your new theme here
};
```

### Step 3: Test the Theme

The new theme will automatically appear in theme selectors and be available through the theme hook.

## CSS Variables

The system uses CSS variables that are automatically updated when themes change:

```css
/* Core colors */
--background: 248 249 250;
--foreground: 26 32 44;
--primary: 0 123 255;
--accent: 202 66 70;

/* Usage in CSS */
.my-element {
  background-color: rgb(var(--background));
  color: rgb(var(--foreground));
  border-color: rgb(var(--border));
}
```

## Tailwind Integration

Use Tailwind classes that reference the CSS variables:

```tsx
<div className="bg-background text-foreground border-border">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Click me
  </button>
</div>
```

## Migration Guide

### From Old System

1. **Replace hardcoded colors** with CSS variable references
2. **Update component imports** to use new ThemeSelector components
3. **Use centralized color classes** instead of custom color definitions

### Example Migration

**Before:**
```tsx
<button className="bg-blue-500 text-white hover:bg-blue-600">
  Button
</button>
```

**After:**
```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Button
</button>
```

## Best Practices

1. **Always use CSS variables** for colors instead of hardcoded values
2. **Use semantic color names** (primary, accent, etc.) instead of specific colors
3. **Test new themes** across all components before deployment
4. **Document custom color schemes** for team members
5. **Use the theme hook** for dynamic theme-based logic

## Troubleshooting

### Theme Not Applying
- Ensure `initializeApp()` is called on app startup
- Check that CSS variables are properly defined
- Verify theme name exists in `colorSchemes` object

### Colors Not Updating
- Clear browser cache and localStorage
- Check console for JavaScript errors
- Ensure CSS variables use correct format (space-separated RGB values)

### Component Styling Issues
- Verify components use CSS variables instead of hardcoded colors
- Check Tailwind classes reference the correct CSS variables
- Ensure dark mode classes are properly applied

## Future Enhancements

The system is designed to support:
- **Multiple theme variants** (high contrast, colorblind-friendly, etc.)
- **User-defined themes** with custom color pickers
- **Automatic theme switching** based on time of day
- **Theme persistence** across sessions
- **Theme synchronization** across devices
