import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Christ University Brand Colors — User Specified
        primary: {
          50: '#e8f0fc',
          100: '#c5d9f8',
          200: '#9ebef3',
          300: '#74a1ed',
          400: '#518be8',
          500: '#2e74e2',
          600: '#154CB3', // ← PRIMARY (Deep Blue)
          700: '#113d92',
          800: '#0D3070',
          900: '#09234F',
          950: '#051530',
        },
        secondary: {
          50: '#fffef0',
          100: '#fffbd4',
          200: '#fff6a3',
          300: '#ffef6d',
          400: '#ffe53a',
          500: '#FFCC00', // ← SECONDARY (Vivid Yellow)
          600: '#e6b800',
          700: '#bf9900',
          800: '#997a00',
          900: '#735c00',
          950: '#4d3d00',
        },
        accent: {
          50: '#e9f5fe',
          100: '#cfe9fd',
          200: '#a1d4fb',
          300: '#6ebdf8',
          400: '#4aacf4',
          500: '#30A4EF', // ← ACCENT (Light Blue)
          600: '#1b8dd6',
          700: '#1572ae',
          800: '#105987',
          900: '#0b4060',
          950: '#062839',
        },
        // Keep slate for UI grays
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(21, 76, 179, 0.12)',
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(21, 76, 179, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
