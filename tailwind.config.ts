import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gece: 'var(--gece)',
        panel: 'var(--panel)',
        panel2: 'var(--panel2)',
        cizgi: 'var(--cizgi)',
        sut: 'var(--sut)',
        sis: 'var(--sis)',
        ates: 'var(--ates)',
        gok: 'var(--gok)',
        kizil: 'var(--kizil)',
        yesil: 'var(--yesil)'
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        condensed: ['"Sofia Sans Condensed"', 'Manrope', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
} satisfies Config
