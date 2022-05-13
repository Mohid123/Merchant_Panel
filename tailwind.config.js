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
      screens: {
        'xl': '1280px',
        '2xl': '1600px',
        '3xl': '1920px',
      },
      colors: {
        'primary-100': '#F7E1AD',
        'primary-400': '#F38B41',
        'primary-500': '#E67B00',
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
        '90px': '90px',
        '35': '35%',
        '38': '38%',
        '48': '48%',
        '62': '62%',
        '65': '65%',
      },
      height: {
        '90px': '90px',
      },
      fontSize: {
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
