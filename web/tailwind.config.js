/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB', // Blue 600
        secondary: '#475569', // Slate 600
        success: '#16A34A', // Green 600
        warning: '#CA8A04', // Yellow 600
        danger: '#DC2626', // Red 600
      }
    },
  },
  plugins: [],
}