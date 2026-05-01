import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './App.jsx', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Thai"', '"IBM Plex Sans Thai"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', '"Noto Sans Thai"', 'serif']
      }
    }
  },
  plugins: [animate]
};
