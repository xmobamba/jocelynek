/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A7A5C',
          light: '#36A689',
          dark: '#064C3A'
        }
      }
    }
  },
  plugins: []
};
