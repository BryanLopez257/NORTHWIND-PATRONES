/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Corporativa Oficial
        corporate: {
          dark: '#0F172A',
          primary: '#2563EB',
          hover: '#1D4ED8',
          bg: '#F8FAFC',
          border: '#E2E8F0',
        },
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Mapeo sky a Azul Primario corporativo
        sky: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
