/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Linear / Vercel-grade deep obsidian dark palette
        canvas: '#09090b',          // Pure dark canvas
        surface: {
          DEFAULT: '#111115',       // Primary card surface
          elevated: '#17171d',      // Elevated modal / popover
          hover: '#1e1e26',         // Interactive hover state
          subtle: '#252530',        // Inset field / background
          inset: '#0d0d10',         // Dark recessed area
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.06)',
          default: 'rgba(255, 255, 255, 0.10)',
          hover: 'rgba(255, 255, 255, 0.18)',
          glow: 'rgba(99, 102, 241, 0.35)',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        dark: {
          950: '#09090b',
          900: '#111115',
          850: '#15151b',
          800: '#1a1a22',
          750: '#22222d',
          700: '#2b2b3a',
        }
      }
    },
  },
  plugins: [],
}
