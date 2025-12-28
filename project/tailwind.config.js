/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2f7',
          100: '#cce5ef',
          200: '#99cbd0',
          300: '#66b0d0',
          400: '#3396c1',
          500: '#246E92',
          600: '#1d5875',
          700: '#164258',
          800: '#0f2c3b',
          900: '#08161e',
        },
      },
    },
  },
  plugins: [],
};
