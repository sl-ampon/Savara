/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sakura: {
          50:  '#fff0f5',
          100: '#ffd6e7',
          200: '#ffadd0',
          300: '#ff84b8',
          400: '#ff5ba1',
          500: '#e8407f',
        },
        sage: {
          100: '#e8f5e9',
          200: '#c8e6c9',
          300: '#a5d6a7',
          400: '#66bb6a',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
