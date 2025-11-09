import type { Metadata } from 'next';
import { Tajawal, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const tajawal = Tajawal({
  weight: ['400', '500', '700'],
  subsets: ['arabic', 'latin'],
  variable: '--font-tajawal',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'تاسكاتك | Taskatek - إدارة المشاريع بذكاء',
  description: 'Taskatek - Arabic-first, AI-powered project management platform',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Default to Arabic as the primary language
  const locale = 'ar';
  const isRTL = locale === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const lang = locale;

  return (
    <html lang={lang} dir={dir} className={isRTL ? 'rtl' : 'ltr'}>
      <body className={`${tajawal.variable} ${inter.variable} font-tajawal antialiased`}>
        <Providers locale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
