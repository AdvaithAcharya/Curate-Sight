/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f8f5f0",
        charcoal: "#2d2d2d",
        bronze: "#b08d57"
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
