import { Google_Sans, Cal_Sans } from 'next/font/google';

export const googleSans = Google_Sans({
  weight: ['400', '500'], style: 'normal', subsets: ['latin'],
  variable: '--font-google-sans', display: 'swap', fallback: ['Arial', 'sans-serif'], adjustFontFallback: false,
});
export const calSans = Cal_Sans({
  weight: '400', style: 'normal', subsets: ['latin'],
  variable: '--font-cal-sans', display: 'swap', fallback: ['Arial', 'sans-serif'], adjustFontFallback: false,
});
