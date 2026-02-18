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
        // Christ University Professional Theme
        primary: {
          50: '#f0f4ff', // Lightest
          100: '#e0eaff',
          200: '#c7d9ff',
          300: '#9ebaff',
          400: '#6d94ff',
          500: '#4169E1', // Royal Blue (Design System Primary)
          600: '#254a9a', // Main primary (Brand Core)
          700: '#1f3d7f',
          800: '#1e3466',
          900: '#1e2f52',
          950: '#111b33',
        },
        tertiary: {
          50: '#fdfaf6',
          100: '#fbf5ed',
          200: '#f7ebd9',
          300: '#f0dbbe',
          400: '#e6c49c',
          500: '#d9aa72',
          600: '#bda361', // Gold (Brand Accent)
          700: '#9e8650',
          800: '#7f6a40',
          900: '#604f2f',
        },
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
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
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
