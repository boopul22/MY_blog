/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        'primary': '#007bff',
        'primary-dark': '#0056b3',
        'secondary': '#6c757d',
        'light': '#f8f9fa',
        'dark': '#1a202c',
        'medium-dark': '#2d3748',
        'light-dark': '#4a5568',
        'dark-text': '#1a202c',
        'light-text': '#f7fafc',
        'accent': '#ca4246',
        'accent-dark': '#b23438',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
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
}