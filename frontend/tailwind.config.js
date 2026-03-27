/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          light: '#faf9f0',
          dark: '#1a1a1a', 
        },
        brand: {
          pink: '#e06b85',
          darkPink: '#c95a72', 
          purple: '#845ec2', 
          teal: '#2c73d2', 
          dark: '#2d1a2d', 
        },
        card: {
          text: '#ffffff',
          price: '#e06b85',
        }
      },
    },
  },
  plugins: [],
}