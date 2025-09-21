/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdf8ed',
          100: '#f8ebd1',
          200: '#f0d9a7',
          300: '#e8c47b',
          400: '#ddb25e',
          500: '#c6a664',
          600: '#a48844',
          700: '#876d32',
          800: '#6b5526',
          900: '#4c3b18',
        },
        sand: {
          50: '#faf6f0',
          100: '#f3ece1',
          200: '#e8dcc9',
          300: '#d9c6a9',
          400: '#c7ae88',
          500: '#b69870',
          600: '#957757',
          700: '#745840',
          800: '#554031',
          900: '#372a20',
        },
        charcoal: {
          700: '#3d3a37',
          800: '#262421',
          900: '#141312',
        },
      },
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'serif'],
        signature: ['"Cormorant Garamond"', 'serif'],
      },
      spacing: {
        'section-sm': 'clamp(3.5rem, 4vw, 5rem)',
        section: 'clamp(4.5rem, 6vw, 7.5rem)',
        'section-lg': 'clamp(6rem, 8vw, 10rem)',
      },
      backgroundImage: {
        'luxury-radial':
          'radial-gradient(circle at 30% 20%, rgba(248, 235, 209, 0.7), transparent 55%)',
        'luxury-linear': 'linear-gradient(135deg, rgba(20, 20, 20, 0.1) 0%, rgba(255, 255, 255, 0) 45%)',
      },
    },
  },
  plugins: [],
};
