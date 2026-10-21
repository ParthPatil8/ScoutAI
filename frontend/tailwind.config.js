/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        scout: {
          bg: '#08090B',
          surface: '#111317',
          card: '#161920',
          cardHover: '#1D212A',
          border: '#242833',
          borderLight: '#323746',
          text: '#F5F7FA',
          muted: '#8C95A6',
          dim: '#555C6D',
          neon: '#CCFF00',
          neonGlow: 'rgba(204, 255, 0, 0.25)',
          neonMuted: 'rgba(204, 255, 0, 0.12)',
          darkGreen: '#0D260D',
          alertRed: '#FF334B',
          alertYellow: '#FFB800',
          alertBlue: '#00A3FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        display: ['Teko', 'Impact', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-sm': '0 0 10px rgba(204, 255, 0, 0.2)',
        'neon': '0 0 20px rgba(204, 255, 0, 0.35)',
        'neon-lg': '0 0 35px rgba(204, 255, 0, 0.45)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scan 8s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
