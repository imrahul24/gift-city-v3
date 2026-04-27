/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg: '#08090d',
        surface: '#13151e',
        surface2: '#1a1d2a',
        surface3: '#21253a',
        accent: '#6c63ff',
        accent2: '#00f5a0',
        gold: '#ffd32a',
        danger: '#ff4757',
        available: '#00f5a0',
        reserved: '#ffd32a',
        sold: '#ff4757',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'ring-fill': 'ringFill 0.9s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 0 0 rgba(108,99,255,0)' }, '50%': { boxShadow: '0 0 16px 3px rgba(108,99,255,0.35)' } },
      },
    },
  },
  plugins: [],
}