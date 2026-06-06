import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts,js,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#020617'
        }
      }
    }
  },
  plugins: []
} satisfies Config
