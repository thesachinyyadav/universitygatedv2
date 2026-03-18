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
          50: '#fffbed',
          100: '#fff6d6',
          200: '#ffecad',
          300: '#ffe07a',
          400: '#ffd94d',
          500: '#ffd22a',
          600: '#FFCC00',
          700: '#cca300',
          800: '#997a00',
          900: '#665200',
        },
      },
    },
  },
  plugins: [],
};
export default config;
