import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdfbf5',
          100: '#f9f3e6',
          200: '#f0e4c4',
          300: '#e5d09a',
          400: '#d4b85c',
          500: '#b8860b',
          600: '#9a7209',
          700: '#7a5b07',
          800: '#5c4405',
          900: '#3d2e04',
        },
        cream: {
          50: '#fefdfb',
          100: '#faf8f3',
          200: '#f5f0e6',
          300: '#ebe3d4',
          400: '#ddd2bc',
        },
        charcoal: {
          800: '#2d2a26',
          900: '#1a1816',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 4px 24px rgba(184, 134, 11, 0.12)',
        'luxury-lg': '0 8px 40px rgba(184, 134, 11, 0.15)',
        'glow': '0 0 20px rgba(184, 134, 11, 0.2)',
        'gold-border': '0 0 0 1px rgba(184, 134, 11, 0.4), 0 0 16px rgba(184, 134, 11, 0.15)',
        'gold-border-hover': '0 0 0 2px rgba(184, 134, 11, 0.5), 0 0 24px rgba(184, 134, 11, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

export default config;
