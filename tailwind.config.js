/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontSize: {
        '3.5xl': ['2rem', '2.298rem']
      },
      colors: {
        'gradient-start': '#31E5FF',
        'gradient-middle': '#448FFF',
        'gradient-end': '#FF82BE'
      }
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/line-clamp')],
};
