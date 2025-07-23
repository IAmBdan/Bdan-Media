/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        customPurple: {
          DEFAULT: '#5a3d76', // Muted Purple
          hover: '#7b519c',  // Slightly vibrant hover purple
        },
        mutedGold: {
          DEFAULT: '#bfa054',
          hover: '#e1c679',
        },
        slateBlue: {
          DEFAULT: '#536d8a',
          hover: '#6887a2',
        },
        slate: {
          500: "#64748b", // Mid-tone slate
          600: "#4b5563", // Slightly darker slate
          700: "#374151", // Dark slate (used for buttons)
        },
        
        steelGray: {
          DEFAULT: '#5a5f66',
          hover: '#71767d',
        },
        richTeal: {
          DEFAULT: '#396f6a',
          hover: '#4d8d89',
        },
        rich_black: "#02111b",
        deep_purple: "#5a3d76",
        light_purple: "#7b519c",
        darkPurple: {
          DEFAULT: '#2a1e40', // Darker purple
          hover: '#3a2b50',   // Slightly lighter for hover
        },
        purple: {
          600: '#5a3d76', // Dark purple
          500: '#7b519c', // Lighter purple for hover
        },
        white: "#fdfdff",
        darkPurple: {
          DEFAULT: '#2c1e30', // Dark purple
          hover: '#3b2840',   // Slightly lighter purple for hover
        },

          mutedBlue: {
            DEFAULT: '#1a2634', // Deep muted blue for the button
            hover: '#1f2e40',  // Slightly lighter muted blue for hover
          },

        rich_black: {
          DEFAULT: '#02111b',
          100: '#000406',
          200: '#01070b',
          300: '#010b11',
          400: '#020e17',
          500: '#02111b',
          600: '#094a76',
          700: '#1082cf',
          800: '#4db0f2',
          900: '#a6d7f8',
        },
        white: {
          DEFAULT: '#fdfdff',
          100: '#000066',
          200: '#0000cc',
          300: '#3333ff',
          400: '#9999ff',
          500: '#fdfdff',
          600: '#ffffff',
          700: '#ffffff',
          800: '#ffffff',
          900: '#ffffff',
        },
        onyx: {
          DEFAULT: '#3f4045',
          100: '#0d0d0e',
          200: '#191a1c',
          300: '#26262a',
          400: '#323338',
          500: '#3f4045',
          600: '#63656d',
          700: '#888a93',
          800: '#b0b1b7',
          900: '#d7d8db',
        },
        jet: {
          DEFAULT: '#38353a',
          100: '#0b0b0c',
          200: '#171518',
          300: '#222023',
          400: '#2d2b2f',
          500: '#38353a',
          600: '#615b65',
          700: '#89828e',
          800: '#b0abb3',
          900: '#d8d5d9',
        },
        raisin_black: {
          DEFAULT: '#30292f',
          100: '#090809',
          200: '#131012',
          300: '#1c181b',
          400: '#252025',
          500: '#30292f',
          600: '#5d4f5a',
          700: '#8a7687',
          800: '#b1a4af',
          900: '#d8d1d7',
        },
      },
    },
  },
  plugins: [],
};