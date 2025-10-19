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
      animationDelay: {
        '100': '0.1s',
        '200': '0.2s',
        '300': '0.3s',
        '500': '0.5s',
        '700': '0.7s',
        '1000': '1s',
      },
      animation: {
        // Original animations
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'slideDown': 'slideDown 0.3s ease-out',
        
        // New Loading Component animations
        'spin-fast': 'spin-fast 0.8s linear infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'spin-reverse': 'spin-reverse 1.2s linear infinite',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'pulse-slow-delayed': 'pulse-slow 2s ease-in-out 1s infinite',
        'bar': 'bar 1s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.5s ease-out',
        'slideUp': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        // Original keyframes
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        slideDown: {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
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
        },
        
        // New Loading Component keyframes
        'spin-fast': {
          'to': { transform: 'rotate(360deg)' }
        },
        'spin-slow': {
          'to': { transform: 'rotate(360deg)' }
        },
        'spin-reverse': {
          'to': { transform: 'rotate(-360deg)' }
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.95)' }
        },
        'bar': {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1)' }
        },
        'fadeIn': {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        'slideUp': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [
    // Plugin for animation-delay utilities
    function({ addUtilities, theme }) {
      const delays = theme('animationDelay');
      const utilities = Object.entries(delays).reduce((acc, [key, value]) => {
        acc[`.animate-delay-${key}`] = {
          'animation-delay': value,
        };
        return acc;
      }, {});
      addUtilities(utilities);
    },
    // Plugin for line-clamp utilities
    function({ addUtilities }) {
      addUtilities({
        '.line-clamp-1': {
          'overflow': 'hidden',
          'display': '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
        },
        '.line-clamp-2': {
          'overflow': 'hidden',
          'display': '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          'overflow': 'hidden',
          'display': '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
      });
    }
  ],
}