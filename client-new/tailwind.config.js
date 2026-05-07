/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // YENİ: Koyu modu 'class' stratejisiyle aktif ediyoruz
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'monster-purple': '#7E57C2',
        'monster-turquoise': '#4DB6AC',
        'monster-dark-blue': '#3F51B5', // YENİ: Koyu mod için lacivert
        'monster-sent-bg': '#E1F5FE',
        'monster-light-bg': '#F5F5F5',
        'monster-active': '#EDE7F6',
      }
    },
  },
  plugins: [],
}