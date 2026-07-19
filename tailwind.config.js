/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  safelist: [
    "bg-blue-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-orange-600",
    "bg-indigo-600",
    "bg-brown-dark",
    "bg-red-600",
    "bg-pink-600",
    "bg-purple-700",
    "bg-rosewood",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F2E9E1",
        brown: {
          DEFAULT: "#846348",
          dark: "#5E4733",
        },
        gold: "#C39F71",
        rosewood: "#A66D5E",
        sage: "#979F85",
      },
      fontFamily: {
        sans: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
    },
  },
  plugins: [],
};
