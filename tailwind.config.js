/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF4B4B',
        'primary-dark': '#CC3333',
        success: '#58CC02',
        'success-dark': '#46A302',
        info: '#1CB0F6',
        'info-dark': '#0090D4',
        warning: '#FFC800',
        'warning-dark': '#CC9F00',
        surface: '#F7F7F7',
        muted: '#777777',
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
