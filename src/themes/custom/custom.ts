// simen-skriver theme
// Each step points at the closest step in the 20-step palette (src/styles/palette.css),
// so the theme's Tailwind classes keep working while components move over to roles.

export const customTheme = {
  primary: {
    50:  '#f7f7f9',  // grey-50
    100: '#f2f2f5',  // grey-100
    200: '#e1e1e7',  // grey-200
    300: '#c5c5cc',  // grey-300
    400: '#9f9fa8',  // grey-400
    500: '#74747c',  // grey-500
    600: '#4d4d54',  // grey-600
    700: '#303035',  // grey-700
    800: '#1c1c1f',  // grey-800
    900: '#151517',  // grey-850 — dark-mode page background (surface-base)
    950: '#0b0b0c',  // grey-950
  },
  highlight: {
    50:  '#e3fff1',  // mint-50
    100: '#d0ffe9',  // mint-100
    200: '#8efbce',  // mint-200
    300: '#5ae3af',  // mint-300
    400: '#23bb8a',  // mint-400
    500: '#0fa377',  // mint-450 — accent / focus
    600: '#035d42',  // mint-600 — readable as text on light surfaces
    700: '#053a28',  // mint-700
    800: '#102019',  // mint-800
    900: '#0b110e',  // mint-900
    950: '#070d0a',  // mint-950
  }
};
