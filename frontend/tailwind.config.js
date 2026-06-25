/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // EDVAX brand: deep legal navy + warm gold accent on a clean off-white.
        ink: {
          DEFAULT: '#0e1a2b',
          soft: '#1c2c43',
          muted: '#566177',
        },
        navy: {
          50: '#eef2f8',
          100: '#d6e0ee',
          600: '#1c3a5e',
          700: '#142b46',
          800: '#0e1f33',
          900: '#0a1626',
        },
        gold: {
          DEFAULT: '#c9a14a',
          soft: '#e2c785',
          dark: '#a07f2e',
        },
        paper: '#f8f7f3',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 6px 24px -8px rgba(14, 31, 51, 0.18)',
      },
    },
  },
  plugins: [],
}
