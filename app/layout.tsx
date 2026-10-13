import type { Metadata } from 'next';
import { googleSans, calSans } from './fonts';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: { default: 'Principia — Calculadoras para ingeniería', template: '%s | Principia' },
  description: 'Calculadoras personales para ingeniería y desarrollo de software. Cálculo local en tu navegador.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang='es' className={`${googleSans.variable} ${calSans.variable}`}>
      <body><div className='site-container'><SiteHeader/><main id='main-content'>{children}</main><footer>Principia · Cálculo local en tu navegador.</footer></div></body>
    </html>
  );
}
