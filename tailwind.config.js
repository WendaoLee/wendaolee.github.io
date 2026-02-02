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
            fontFamily:" 'OPPO Sans 4.0', 'Source Han Serif CN VF' !important;",
            '--tw-prose-body': '#334155',
            '--tw-prose-headings': '#1e293b',
            '--tw-prose-links': '#1e293b',
            '--tw-prose-bold': '#1e293b',
            '--tw-prose-counters': '#334155',
            '--tw-prose-bullets': '#334155',
            '--tw-prose-quotes': '#1e293b',
            '--tw-prose-code': '#1e293b',
            color: 'var(--tw-prose-body)',
            h1:{
              fontWeight:700,
              fontSize:"2em",
              color: 'var(--tw-prose-headings)',
            },
            h2: { color: 'var(--tw-prose-headings)' },
            h3: { color: 'var(--tw-prose-headings)' },
            h4: { color: 'var(--tw-prose-headings)' },
            strong: { color: 'var(--tw-prose-bold)' },
            a: { color: 'var(--tw-prose-links)' },
            code: { color: 'var(--tw-prose-code)' },
          },
        }
      }
    },
  },
  plugins: [require("@tailwindcss/typography"),require('daisyui')],
}
