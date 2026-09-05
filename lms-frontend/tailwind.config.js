/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: "#5B5BF7",
        secondary: "#F5F7FF",
        dark: "#252525",
        muted: "#7A7B7D",
      },
    },
  },
  plugins: [],
};