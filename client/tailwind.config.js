/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0A0907',
        surface: '#111009',
        felt: '#0C1C10',
        elevated: '#1A1814',
        gold: {
          DEFAULT: '#C8862A',
          bright: '#F5C842',
          dim: '#7A5118',
        },
        loss: {
          DEFAULT: '#C63535',
          dim: '#6B1C1C',
        },
        win: {
          DEFAULT: '#2A7A4A',
          felt: '#0F2A18',
        },
        dice: '#F2EDE4',
        txt: {
          primary: '#E8E2D6',
          muted: '#6B6560',
          faint: '#3A3530',
        },
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', 'serif'],
        mono: ['"DM Mono"', 'monospace'],
        body: ['"Lora"', 'serif'],
      },
      borderColor: {
        gold: 'rgba(200, 134, 42, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'dice-tumble': 'diceTumble 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'count-up': 'countUp 0.6s ease-out',
        'stamp': 'stamp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        diceTumble: {
          '0%': { transform: 'rotateX(0) rotateY(0) rotateZ(0)' },
          '25%': { transform: 'rotateX(180deg) rotateY(90deg) rotateZ(45deg)' },
          '50%': { transform: 'rotateX(360deg) rotateY(180deg) rotateZ(90deg)' },
          '75%': { transform: 'rotateX(540deg) rotateY(270deg) rotateZ(135deg)' },
          '100%': { transform: 'rotateX(720deg) rotateY(360deg) rotateZ(180deg)' },
        },
        stamp: {
          '0%': { transform: 'scale(2)', opacity: '0' },
          '50%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
