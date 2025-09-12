import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        bg: 'rgb(var(--bg))', 
        fg: 'rgb(var(--fg))',
        muted: 'rgb(var(--muted))', 
        'muted-fg': 'rgb(var(--muted-fg))',
        card: 'rgb(var(--card))', 
        'card-fg': 'rgb(var(--card-fg))',
        border: 'rgb(var(--border))', 
        ring: 'rgb(var(--ring))',
        primary: 'rgb(var(--primary))', 
        'primary-foreground': 'rgb(var(--primary-fg))',
        secondary: 'rgb(var(--secondary))', 
        'secondary-foreground': 'rgb(var(--secondary-fg))',
        destructive: 'rgb(var(--destructive))', 
        'destructive-foreground': 'rgb(var(--destructive-fg))',
        accent: 'rgb(var(--accent))', 
        'accent-foreground': 'rgb(var(--accent-fg))',
      },
      borderRadius: { 
        xl: '1rem', 
        '2xl': '1.5rem', 
        '3xl': '2rem' 
      },
      boxShadow: { 
        soft: '0 4px 20px rgba(15,23,42,.08)',
        glow: '0 0 30px rgba(16, 185, 129, 0.3)',
        'glow-lg': '0 0 60px rgba(16, 185, 129, 0.4)',
      },
      keyframes: {
        pop: { 
          '0%': { transform: 'scale(.95)', opacity: '0' }, 
          '100%': { transform: 'scale(1)', opacity: '1' } 
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
      },
      animation: { 
        pop: 'pop .3s ease-out',
        slideUp: 'slideUp .5s ease-out',
        fadeIn: 'fadeIn .4s ease-out',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('tailwindcss-animate')],
}

export default config