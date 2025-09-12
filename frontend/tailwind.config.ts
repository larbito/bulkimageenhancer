import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        bg: 'rgb(var(--bg))', fg: 'rgb(var(--fg))',
        muted: 'rgb(var(--muted))', 'muted-fg': 'rgb(var(--muted-fg))',
        card: 'rgb(var(--card))', 'card-fg': 'rgb(var(--card-fg))',
        border: 'rgb(var(--border))', ring: 'rgb(var(--ring))',
        primary: 'rgb(var(--primary))', 'primary-foreground': 'rgb(var(--primary-fg))',
        secondary: 'rgb(var(--secondary))', 'secondary-foreground': 'rgb(var(--secondary-fg))',
        destructive: 'rgb(var(--destructive))', 'destructive-foreground': 'rgb(var(--destructive-fg))',
      },
      borderRadius: { xl: '1rem', '2xl': '1.25rem' },
      boxShadow: { soft: '0 4px 18px rgba(15,23,42,.08)' },
      keyframes: {
        pop: { '0%': { transform: 'scale(.98)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
      animation: { pop: 'pop .2s ease-out' },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/line-clamp'), require('tailwindcss-animate')],
}

export default config


