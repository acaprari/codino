/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'child-sm': '16px',
        'child-base': '18px',
        'child-lg': '20px',
        'child-xl': '24px',
      },
      spacing: {
        'child': '60px',
      },
    },
  },
  plugins: [],
}

