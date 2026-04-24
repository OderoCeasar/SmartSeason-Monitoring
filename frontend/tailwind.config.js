/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        soil: {
          50: '#f8f5ef',
          100: '#efe4d2',
          200: '#dfc8a1',
          300: '#cea86f',
          400: '#bb8748',
          500: '#9d6a33',
          600: '#7c5228',
          700: '#5f3f20',
          800: '#412c18',
          900: '#271a0e',
        },
        leaf: {
          50: '#eef8f1',
          100: '#d6efdd',
          200: '#addfba',
          300: '#7bc892',
          400: '#4aa86b',
          500: '#2f8751',
          600: '#23683e',
          700: '#1b4e2f',
          800: '#123520',
          900: '#0a1f12',
        },
        sun: {
          50: '#fff8e7',
          100: '#ffefc2',
          200: '#ffe191',
          300: '#ffd05d',
          400: '#f2b936',
          500: '#d79a1d',
          600: '#a97717',
          700: '#7c5713',
          800: '#52390d',
          900: '#2d1f07',
        },
        mist: {
          50: '#f6f8fb',
          100: '#e9edf3',
          200: '#d5dce6',
          300: '#b1bdcc',
          400: '#8a99ac',
          500: '#667489',
          600: '#4c5667',
          700: '#373e4a',
          800: '#232831',
          900: '#11151b',
        },
        danger: '#c2410c',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 20px 60px rgba(17, 21, 27, 0.08)',
        soft: '0 10px 30px rgba(47, 135, 81, 0.12)',
      },
      backgroundImage: {
        'field-glow':
          'radial-gradient(circle at top left, rgba(123, 200, 146, 0.22), transparent 35%), radial-gradient(circle at bottom right, rgba(255, 209, 98, 0.2), transparent 30%)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
