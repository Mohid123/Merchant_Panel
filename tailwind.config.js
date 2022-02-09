const primaryColors = {
  light: '#F7E1AD',
  DEFAULT: '#E9A608',
  dark: '#E67B00',
};

module.exports = {
  important: true,
  prefix: '',
  purge: {
    enabled: process.env.TAILWIND_MODE === 'build',
    content: ['./src/**/*.{html,ts}', './projects/**/*.{html,ts}'],
  },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-100': '#F7E1AD',
        'primary-400': '#E9A608',
      },
      width: {
        '35': '35%',
        '38': '38%',
        '48': '48%',
        '62': '62%',
        '65': '65%',
      },
      fontSize: {
        '45px': '45px'
      },
      flexGrow: {
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
      }
    },
    fontFamily: {
      display: ['roboto', 'sans-serif'],
      body: ['roboto', 'sans-serif'],
    },
    container: {
      center: true,
      padding: '1.5rem',
    },
    extends: {
      color: {
        inherit: 'inherit',
        transparent: 'transparent',
        current: 'currentColor',
      },
    },
    linearBorderGradients: {
      directions: {
        // defaults to these values
        dp: '109deg',
        t: 'to top',
        tr: 'to top right',
        r: 'to right',
        br: 'to bottom right',
        b: 'to bottom',
        bl: 'to bottom left',
        l: 'to left',
        tl: 'to top left',
      },
      colors: {
        p: ['#59C8D1 0%', '#75F16D 100%'],
      },
      background: {
        'bg': primaryColors.DEFAULT,
        'bg-light': primaryColors.light,
        'bg-dark': primaryColors.dark,
      },
      border: {
        // defaults to these values (optional)
        1: '1px',
        2: '2px',
        4: '4px',
      },
    },
  },
  variants: {
    linearBorderGradients: ['responsive', 'hover', 'dark'], // defaults to ['responsive']
  },
  plugins: [],
};
