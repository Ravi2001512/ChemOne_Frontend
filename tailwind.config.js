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
        ink: {
          DEFAULT: '#0a0a0a',
          lighter: '#111111',
        },
        muted: '#3a3a3a',
        sub: '#555',
      },
      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
}
