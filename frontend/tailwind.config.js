/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#F0F7FF',
          100: '#CEE0F3',     // Light Blue - for subtle backgrounds, borders
          500: '#2D7C9C',     // Teal Blue - for primary buttons, icons, accents
          600: '#24637D',     // Darker Teal - for button hovers or active states
          700: '#1B4A5E',     // Deep Teal
          900: '#214491',     // Deep Navy - for headings, primary text
        },
        'brand': {
          light: '#CEE0F3',   // Light Blue - section backgrounds, cards, dividers, icon containers
          DEFAULT: '#2D7C9C', // Teal Blue - icons, subheadings, hover states, primary buttons
          dark: '#214491',    // Deep Navy - headings, main nav, button hover states
        },
        'text': {
          main: '#1F2937',      // Equivalent to gray-800
          secondary: '#4B5563', // Equivalent to gray-600
        },
        'status': {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
        'white': '#FFFFFF',
      },
      fontFamily: {
        'prompt': ['Prompt', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(33, 68, 145, 0.08)',
      },
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.5s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      }
    }
  },
  plugins: [],
}
