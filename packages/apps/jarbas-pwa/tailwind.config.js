/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        jarbas: {
          50: 'rgb(var(--jarbas-50) / <alpha-value>)',
          100: 'rgb(var(--jarbas-100) / <alpha-value>)',
          200: 'rgb(var(--jarbas-200) / <alpha-value>)',
          300: 'rgb(var(--jarbas-300) / <alpha-value>)',
          400: 'rgb(var(--jarbas-400) / <alpha-value>)',
          500: 'rgb(var(--jarbas-500) / <alpha-value>)',
          600: 'rgb(var(--jarbas-600) / <alpha-value>)',
          700: 'rgb(var(--jarbas-700) / <alpha-value>)',
          800: 'rgb(var(--jarbas-800) / <alpha-value>)',
          900: 'rgb(var(--jarbas-900) / <alpha-value>)',
          950: 'rgb(var(--jarbas-950) / <alpha-value>)'
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'star-spin-slow': 'star-spin 6s linear infinite',
        'star-spin-fast': 'star-spin 1.4s linear infinite',
        'star-ripple': 'star-ripple 1.8s ease-out infinite',
        'star-pulse': 'star-pulse 1.1s ease-in-out infinite',
        'star-breathe': 'star-breathe 3.2s ease-in-out infinite',
        'star-beam-spin': 'star-spin 2.2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)' }
        },
        'star-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'star-ripple': {
          '0%': { transform: 'scale(0.9)', opacity: '0.6' },
          '100%': { transform: 'scale(1.9)', opacity: '0' }
        },
        'star-pulse': {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.08)', filter: 'brightness(1.35)' }
        },
        'star-breathe': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.04)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
};
