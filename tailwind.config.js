/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#050B18',
          800: '#071126',
          700: '#09142A',
          600: '#0D1B3A',
          500: '#122450',
        },
        electric: {
          blue: '#00A8FF',
          purple: '#6D4AFF',
          violet: '#8B5CF6',
          cyan: '#22D3EE',
          pink: '#E946FF',
        },
        primary: '#2563FF',
        danger: '#FF3158',
        'high-risk': '#FF9F1C',
        'medium-risk': '#20C96B',
        'low-risk': '#149EFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 25px rgba(120,70,255,.35)',
        'glow-blue': '0 0 25px rgba(0,140,255,.25)',
        'glow-cyan': '0 0 20px rgba(0,220,255,.20)',
        'glow-pink': '0 0 25px rgba(233,70,255,.30)',
        'card': '0 10px 40px rgba(0,0,0,0.25)',
        'card-hover': '0 15px 50px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-breathe': 'glowBreathe 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glowBreathe: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}
