import './globals.css';
import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { AppProvider } from '@/components/app-provider';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tinewe — With you, every step',
  description:
    'Tinewe is a privacy-first personal safety and support application. Safe journey tracking, live location sharing, emergency assistance and discreet support resources.',
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7FBFD' },
    { media: '(prefers-color-scheme: dark)', color: '#171321' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCfSk0U5bGfOJL4D6QzvApe0"
          crossOrigin=""
        />
      </head>
      <body className={`${manrope.variable} ${inter.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppProvider>{children}</AppProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
