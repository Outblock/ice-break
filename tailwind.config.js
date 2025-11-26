/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'press-start-2p': ['var(--font-press-start-2p)'],
        vt323: ['var(--font-vt323)', 'var(--font-noto-sans-sc)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
