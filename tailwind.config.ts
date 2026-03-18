import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SOCIO Brand Theme
        primary: {
          50: '#edf4ff',
          100: '#dbe9ff',
          200: '#b7d3ff',
          300: '#83b2ff',
          400: '#4c8cff',
          500: '#2568e8',
          600: '#154CB3',
          700: '#123f95',
          800: '#10357b',
          900: '#0d2a61',
        },
        secondary: {
          50: '#ffffff',
          100: '#fefefe',
          200: '#fcfcfc',
          300: '#fafafa',
          400: '#f7f7f7',
          500: '#f5f5f5',
          600: '#ffffff', // Pure white
          700: '#e8e8e8',
          800: '#d1d1d1',
          900: '#bababa',
        },
        tertiary: {
          50: '#faf7ef',
          100: '#f3ecd8',
          200: '#e8dbb4',
          300: '#dcc88d',
          400: '#d1b968',
          500: '#caa845',
          600: '#C9A227',
          700: '#a4831f',
          800: '#7e6518',
          900: '#5b4912',
        },
      },
    },
  },
  plugins: [],
};
export default config;
