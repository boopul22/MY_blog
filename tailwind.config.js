/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./types/**/*.{js,ts,jsx,tsx}",
    "./config/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'selector',
  // Optimize for production builds
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Use CSS variables for consistent theming
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

        // Legacy colors for backward compatibility (will be phased out)
        'primary-dark': '#0056b3',
        'accent-dark': '#b23438',
        light: '#f8f9fa',
        dark: '#1a202c',
        'medium-dark': '#2d3748',
        'light-dark': '#4a5568',
        'dark-text': '#1a202c',
        'light-text': '#f7fafc',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  // Optimize CSS output
  corePlugins: {
    // Disable unused core plugins to reduce bundle size
    preflight: true, // Keep for CSS reset
    container: false, // Not used in this project
    accessibility: true, // Keep for a11y
    appearance: false, // Not used
    backdropBlur: false, // Not used
    backdropBrightness: false, // Not used
    backdropContrast: false, // Not used
    backdropGrayscale: false, // Not used
    backdropHueRotate: false, // Not used
    backdropInvert: false, // Not used
    backdropOpacity: false, // Not used
    backdropSaturate: false, // Not used
    backdropSepia: false, // Not used
    backgroundAttachment: false, // Not used
    backgroundClip: false, // Not used
    backgroundOrigin: false, // Not used
    backgroundRepeat: false, // Not used
    backgroundSize: false, // Not used
    blur: false, // Not used
    brightness: false, // Not used
    contrast: false, // Not used
    dropShadow: false, // Not used
    grayscale: false, // Not used
    hueRotate: false, // Not used
    invert: false, // Not used
    saturate: false, // Not used
    sepia: false, // Not used
    filter: false, // Not used
    backdropFilter: false, // Not used
  },
}