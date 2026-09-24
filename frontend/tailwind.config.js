/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#FDF7F4',
          100: '#FAEFE9',
          200: '#F4DDCE',
          300: '#E9BA9F',
          400: '#DB926E',
          500: '#C86D51', // primary terracotta
          600: '#B65A3F',
          700: '#99462F',
          800: '#7E3A28',
          900: '#673224',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FDFBF8',
          200: '#FAF7F2', // main background
          300: '#F5EFE6',
          400: '#EDE4D6',
        },
        sand: {
          50: '#F8F6F2',
          100: '#F2EDE4',
          200: '#E7DECf',
          300: '#D7CBBA',
          400: '#C3B49E',
        },
        clay: {
          100: '#EAE6E3',
          200: '#CCC5BF',
          400: '#8E827B',
          600: '#62544C',
          800: '#4A3B32', // primary text & deep clay
          900: '#322720',
        },
        sage: {
          50: '#F4F6F4',
          100: '#E8ECE6',
          200: '#D1DAD0',
          500: '#7A8B78',
          600: '#647562',
          700: '#4F5D4D',
          800: '#3D493B',
        },
        ochre: {
          400: '#E5AF5D',
          500: '#D49B4B',
          600: '#BD8337',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(74, 59, 50, 0.05), 0 1px 2px rgba(74, 59, 50, 0.03)',
        'warm-md': '0 4px 12px rgba(74, 59, 50, 0.08), 0 2px 4px rgba(74, 59, 50, 0.04)',
        'warm-lg': '0 12px 28px rgba(74, 59, 50, 0.12), 0 4px 8px rgba(74, 59, 50, 0.06)',
      }
    },
  },
  plugins: [],
}
