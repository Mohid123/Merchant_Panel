const primaryColors = {
  light: '#93C5FD',
  DEFAULT: '#0081E9',
  dark: '#0081E9',
};

const extendedSize = {
  unset: 'unset',
  14: '3.5rem',
  18: '4.5rem',
  26: '6.375rem',
  32.5: '8.12rem',
  40: '10rem',
  48: '12rem',
  50: '12.5rem',
  54: '13.5rem',
  60: '15rem',
  64: '16rem',
  68: '17rem',
  70: '17.5rem',
  72: '18rem',
  88: '22rem',
  100: '25rem',
  116: '29rem',
  124: '31rem',
  132: '33rem',
  136: '34rem',
  150: '37.5rem',
  180: '45rem',
  204: '51rem',
  216: '54rem',
  240: '60rem',
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
      screens: {
        'xs': '500px',
        'xl': '1280px',
        '1.5xl': '1440px',
        '2xl': '1600px',
        '3xl': '1920px',
      },
      colors: {
        'primary-100': '#93C5FD',
        'primary-400': '#F38B41',
        'primary-500': '#0081E9',
        'custom-black' : {
          '100': '#4e5970b3',
          '600': '#4E5970',
          '900': '#191919',
        },
        'font-gray' : {
          '600': '#9399B2',
          '800': '#787F9F',
        }
      },
      width: {
        'r22': '22rem',
        '29': '7.25rem',
        '86px': '86px',
        '90px': '90px',
        '35': '35%',
        '38': '38%',
        '48': '48%',
        '62': '62%',
        '65': '65%',
      },
      maxWidth: {
        '50': '12.5rem',
        '60': '15rem',
        '68': '17rem',
        '124': '31rem',
        '128': '32rem',
      },
      minWidth: {
        '48': '12rem',
        '64': '16rem',
        'lg': '32rem',
      },
      height: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.375rem',
        '54': '13.5rem',
        '68': '17rem',
        '88': '22rem',
        '116': '29rem',
        '132': '33rem',
        '136': '34rem',
        '180': '45rem',
        '216': '54rem',
      },
      minHeight: {
        '14': '3.5rem',
        '18': '4.5rem',
        '40': '10rem',
        '48': '12rem',
        '64': '16rem',
        '72': '18rem',
        'lg': '32rem',
      },
      fontSize: {
        'xxs': '0.625rem',
        'xs2': '0.688rem',
        '4.5xl': '2.5rem',
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
