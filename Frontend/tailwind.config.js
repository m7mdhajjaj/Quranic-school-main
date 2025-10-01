/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px', // Extra small screens
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'slide-in-right': {
          'from': { transform: 'translateX(-20px)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' }
        },
        'scale-in': {
          'from': { transform: 'scale(0.95) translateY(-10px)', opacity: '0' },
          'to': { transform: 'scale(1) translateY(0)', opacity: '1' }
        },
        'slide-in': {
          'from': { transform: 'scaleX(0)', opacity: '0' },
          'to': { transform: 'scaleX(1)', opacity: '1' }
        },
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' }
        }
      }
    },
  },
  plugins: [],
}