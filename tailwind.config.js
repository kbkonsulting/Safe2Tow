/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand-yellow': '#FBBF24',
        'dark-blue': '#1a202c',
      }
    },
  },
  plugins: [],
}