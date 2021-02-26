module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      minWidth: {
        '10': '60px'
      },
      screens: {
        'cat': '1120px'
      }
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active']
    }
  },
  plugins: [],
}
