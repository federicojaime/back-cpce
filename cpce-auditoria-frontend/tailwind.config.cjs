/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cpce: {
          blue: '#0066cc',
          darkblue: '#003d7a',
          gray: '#6b7280',
          teal: '#0d9488',
          'teal-dark': '#0f766e'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}