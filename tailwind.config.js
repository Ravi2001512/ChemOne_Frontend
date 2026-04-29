/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        acid: {
          DEFAULT: '#c8f230',
          dim: 'rgba(200,242,48,0.12)',
          glow: 'rgba(200,242,48,0.35)',
        },

        // 🟡 Vesak Theme Colors (NEW)
        vesak: {
          light: '#fff7cc',
          DEFAULT: '#ffe680',
          deep: '#ffd54d',
          glow: 'rgba(255, 223, 100, 0.4)',
        },

        ink: {
          DEFAULT: '#0a0a0a',
          lighter: '#111111',
          2: 'var(--ink2)',
        },
        surface: 'var(--surface)',
        border: 'var(--border)',
        muted: '#3a3a3a',
        sub: '#555',
      },

      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      animation: {
        'scanline': 'scanline 3s linear infinite',
        'glitch1': 'glitch1 2s infinite',
        'glitch2': 'glitch2 2s infinite',
        'fade-slide': 'fadeSlide 0.5s cubic-bezier(0.22, 0.68, 0, 1.15) both',
        'blink': 'blink 1s step-end infinite',
        'pulse-acid': 'pulseAcid 2s ease-in-out infinite',
        'spin-cw': 'spinCW 0.7s linear infinite',
        'ticker': 'ticker 22s linear infinite',
        'float-orb': 'floatOrb 18s ease-in-out infinite',

        // 🏮 Vesak Animations (NEW)
        'float-up': 'floatUp 12s linear infinite',
        'lantern-sway': 'lanternSway 3s ease-in-out infinite',
        'vesak-glow': 'vesakGlow 2.5s ease-in-out infinite',
        'bubble': 'bubble 6s ease-in infinite',
      },

      keyframes: {
        bubble: {
          '0%': { transform: 'translateY(100vh) scale(0.5)', opacity: '0' },
          '50%': { opacity: '0.8' },
          '100%': { transform: 'translateY(-20vh) scale(1.2)', opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },

        glitch1: {
          '0%, 100%': { clipPath: 'inset(0 0 98% 0)', transform: 'translate(-2px,0)' },
          '20%': { clipPath: 'inset(30% 0 50% 0)', transform: 'translate(2px,0)' },
          '40%': { clipPath: 'inset(70% 0 5% 0)', transform: 'translate(-1px,0)' },
          '60%': { clipPath: 'inset(15% 0 75% 0)', transform: 'translate(1px,0)' },
          '80%': { clipPath: 'inset(55% 0 20% 0)', transform: 'translate(-2px,0)' },
        },

        fadeSlide: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },

        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },

        pulseAcid: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200,242,48,0.35)' },
          '50%': { boxShadow: '0 0 0 8px rgba(200,242,48,0)' },
        },

        spinCW: {
          to: { transform: 'rotate(360deg)' },
        },

        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },

        floatOrb: {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(40px,-60px) scale(1.1)' },
          '66%': { transform: 'translate(-30px,30px) scale(0.9)' },
        },

        // 🏮 Floating lantern
        floatUp: {
          '0%': {
            transform: 'translateY(100vh) scale(0.8)',
            opacity: '0',
          },
          '20%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(-20vh) scale(1)',
            opacity: '0',
          },
        },

        // 🎐 Gentle swing
        lanternSway: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },

        // ✨ Glow pulse
        vesakGlow: {
          '0%, 100%': {
            filter: 'drop-shadow(0 0 4px rgba(255,223,100,0.3))',
          },
          '50%': {
            filter: 'drop-shadow(0 0 12px rgba(255,223,100,0.7))',
          },
        },
      },
    },
  },

  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};