/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carrier: {
          bg: '#070A12',
          surface: '#0D1424',
          card: '#121A2D',
          border: '#1E293B',
          cyan: '#00F0FF',
          emerald: '#10B981',
          amber: '#F59E0B',
          crimson: '#EF4444',
          indigo: '#6366F1',
          slate: '#94A3B8'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'strobe': 'strobe 1.5s ease-in-out infinite',
      },
      keyframes: {
        strobe: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(1.2)' },
        }
      }
    },
  },
  plugins: [],
}
