/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: colors.blue,
        gray: colors.slate,
        error: colors.red,
        warning: colors.orange,
        success: colors.green,
      },
    },
  },
  plugins: [],
};
