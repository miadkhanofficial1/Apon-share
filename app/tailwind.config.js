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
        apon: {
          bg: '#FFFFFF',
          card: '#F8FAFC',
          navy: '#0F172A',
          'navy-light': '#1E293B',
          cyan: '#0284C7',
          'cyan-bright': '#38BDF8',
          'dark-bg': '#090D16',
          'dark-card': '#0F172A',
          'dark-surface': '#131B2E',
          'dark-border': '#1E293B',
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif'
        ],
      },
      animation: {
        'radar-sweep': 'radarSweep 4s linear infinite',
        'pulse-subtle': 'pulseSubtle 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.85, transform: 'scale(1.03)' },
        }
      }
    },
  },
  plugins: [],
}
