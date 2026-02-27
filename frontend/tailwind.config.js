/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1e1e2f',
          dim: '#121212',
          bright: '#25253a',
          container: '#1a1a2e',
          'container-high': '#222238',
          'container-highest': '#2a2a42',
        },
        primary: {
          DEFAULT: '#00cfff',
          container: 'rgba(0, 207, 255, 0.12)',
          on: '#003544',
        },
        secondary: {
          DEFAULT: '#7c4dff',
          container: 'rgba(124, 77, 255, 0.12)',
          on: '#21005d',
        },
        success: {
          DEFAULT: '#00ff9d',
          container: 'rgba(0, 255, 157, 0.12)',
        },
        warning: {
          DEFAULT: '#ffb300',
          container: 'rgba(255, 179, 0, 0.12)',
        },
        error: {
          DEFAULT: '#ff3d71',
          container: 'rgba(255, 61, 113, 0.12)',
        },
        'on-surface': '#e6e1e5',
        'on-surface-variant': '#c4c0c8',
        outline: 'rgba(255, 255, 255, 0.12)',
        'outline-variant': 'rgba(255, 255, 255, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'elevated-1': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'elevated-2': '0 4px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
        'elevated-3': '0 10px 20px rgba(0,0,0,0.4), 0 6px 6px rgba(0,0,0,0.3)',
        'glow-primary': '0 0 20px rgba(0, 207, 255, 0.15)',
        'glow-secondary': '0 0 20px rgba(124, 77, 255, 0.15)',
        'glow-success': '0 0 20px rgba(0, 255, 157, 0.15)',
        'glow-error': '0 0 20px rgba(255, 61, 113, 0.15)',
        'glow-warning': '0 0 20px rgba(255, 179, 0, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
