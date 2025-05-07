/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'status-badge': 'status-badge 0.3s cubic-bezier(0.4,0,0.2,1)',
      },
      keyframes: {
        'status-badge': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.85)',
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [],
} 