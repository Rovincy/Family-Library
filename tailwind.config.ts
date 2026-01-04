import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        igBlue: '#405DE6',
        igPink: '#FD1D1D',
        igOrange: '#F56040',
        igYellow: '#F77737',
        igPurple: '#E1306C',
      },
    },
  },
  plugins: [],
} satisfies Config