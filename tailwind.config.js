/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#22223a",
        "surface-2": "#2a2a3e",
        "surface-3": "#32324a",
        border: "#3a3a52",
      },
    },
  },
  plugins: [],
};
