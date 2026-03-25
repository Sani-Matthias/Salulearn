/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blue-trust': '#0077CC',
        'green-health': '#3CB371',
        'white-clarity': '#FFFFFF',
        'dark-blue-depth': '#1A1F36',
        'turquoise-freshness': '#5FE3C0',
        'gold': '#f7b500',
        'orange': '#f97316',
        'red': '#ef4444',
        'text-dim': '#4b5563',
      },
      fontFamily: {
        fredoka: ['Fredoka', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
