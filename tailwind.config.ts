import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        terra: {
          DEFAULT: '#b55a3a',
          light: '#d4745a',
          dark: '#8b3f27',
          muted: '#e8c4b0',
          subtle: '#f5e8e0',
        },
        cream: {
          DEFAULT: '#f8f3ec',
          dark: '#ede5d8',
          deeper: '#e0d4c0',
        },
        charcoal: {
          DEFAULT: '#1e1916',
          muted: '#4a3f38',
          soft: '#8a7a72',
        },
        sage: { DEFAULT: '#6b7d72', light: '#a3b09a' },
        sand: { DEFAULT: '#e2d5c0', light: '#f0e8d8' },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body: ['Satoshi', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'gradient-x': {
          '0%,100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'scroll-bounce': {
          '0%,100%': { transform: 'translateY(0)', opacity: '0.6' },
          '50%': { transform: 'translateY(7px)', opacity: '1' },
        },
      },
      animation: {
        'gradient-x': 'gradient-x 5s ease infinite',
        'scroll-bounce': 'scroll-bounce 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
