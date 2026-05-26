/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        elev: 'var(--bg-elev)',
        card: 'var(--bg-card)',
        felt: 'var(--felt)',
        'felt-deep': 'var(--felt-deep)',
        ash: 'var(--ash)',
        hairline: 'var(--hairline)',
        'hairline-hi': 'var(--hairline-hi)',
        ivory: 'var(--ivory)',
        'ivory-edge': 'var(--ivory-edge)',
        pip: 'var(--pip)',
        gold: 'var(--gold)',
        'gold-bright': 'var(--gold-bright)',
        'gold-soft': 'var(--gold-soft)',
        red: 'var(--red)',
        'red-hot': 'var(--red-hot)',
        green: 'var(--green)',
        bone: 'var(--bone)',
        'bone-dim': 'var(--bone-dim)',
        'bone-faint': 'var(--bone-faint)',
      },
      borderColor: {
        hairline: 'var(--hairline)',
        'hairline-hi': 'var(--hairline-hi)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        ui: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 600ms cubic-bezier(0.2, 0.7, 0.2, 1) both',
        shimmer: 'shimmer 2.4s infinite linear',
      },
      transitionTimingFunction: {
        'silk': 'cubic-bezier(0.2, 0.7, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
