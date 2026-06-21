import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { SkipLink } from '@/components/layout/SkipLink';
import { Providers } from '@/components/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: { default: 'EcoTrace — Carbon Footprint Tracker', template: '%s | EcoTrace' },
  description: 'Track, understand, and reduce your personal carbon footprint.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <Providers>
          <SkipLink />
          {children}
        </Providers>
      </body>
    </html>
  );
}
