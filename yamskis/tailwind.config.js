/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5fbf6',
          100: '#e7f6e9',
          200: '#cfeccd',
          300: '#a9d9aa',
          400: '#76bf78',
          500: '#4fa75f',
          600: '#3d8f4c',
          700: '#2f7340',
          800: '#245a31',
          900: '#1d4627'
        }
      }
    }
  },
  plugins: []

}