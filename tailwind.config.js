/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none', // 去除最大宽度限制
            fontFamily:" Cantarell, 'Source Han Serif CN VF' !important;"
          },
        }
      }
    },
  },
  plugins: [require("@tailwindcss/typography"),require('daisyui')],
}
