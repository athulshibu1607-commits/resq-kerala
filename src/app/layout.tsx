import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/store';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import SmartInstallBanner from '@/components/SmartInstallBanner';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const viewport: Viewport = {
  themeColor: '#0A192F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'RESQ KERALA | Disaster Management & Emergency Response Network',
  description:
    'Life-critical civic intervention, rapid emergency mobilization, GIS hazard mapping, and real-time community coordination across Kerala.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'RESQ KERALA',
  },
  applicationName: 'RESQ KERALA',
  keywords: [
    'Kerala Flood Relief',
    'Kerala Disaster Management',
    'SOS Emergency Kerala',
    'KSDMA',
    'Aluva Flood',
    'Wayanad Landslide',
    'Relief Camps Kerala',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
        <link rel="alternate" type="application/manifest+json" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RESQ KERALA" />
        <meta name="application-name" content="RESQ KERALA" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen flex flex-col bg-surface dark:bg-command-navy text-on-surface dark:text-white transition-colors antialiased">
        <AppProvider>
          <ServiceWorkerRegister />
          <Header />
          <div className="flex-1 pt-24 sm:pt-28 pb-20 lg:pb-0">{children}</div>
          <SmartInstallBanner />
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
