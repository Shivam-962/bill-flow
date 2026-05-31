import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BillFlow ERP - Smart Billing, Inventory & Customer Management',
  description: 'Enterprise-grade POS Billing and Stock Management SaaS for grocery, medical, fashion, and retail shops.',
  keywords: ['POS Billing', 'ERP System', 'Inventory Control', 'GST Billing Software', 'Retail ERP', 'SaaS Billing', 'Customer Ledger Book'],
  authors: [{ name: 'BillFlow ERP Team' }],
  creator: 'BillFlow ERP',
  publisher: 'BillFlow ERP',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://billflow-erp.vercel.app',
    title: 'BillFlow ERP - Smart Billing, Inventory & Customer Management',
    description: 'Enterprise-grade POS Billing and Stock Management SaaS for grocery, medical, fashion, and retail shops.',
    siteName: 'BillFlow ERP',
    images: [
      {
        url: 'https://billflow-erp.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BillFlow ERP - Smart POS Terminal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BillFlow ERP - Smart POS Terminal',
    description: 'Enterprise-grade POS Billing and Stock Management SaaS for grocery, medical, fashion, and retail shops.',
    images: ['https://billflow-erp.vercel.app/og-image.png'],
  },
};

export const viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('bf_theme');
                const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                const savedColor = localStorage.getItem('bf_color_theme');
                if (savedColor) {
                  document.documentElement.classList.add('theme-' + savedColor);
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="antialiased relative min-h-screen">
        <div className="mesh-glow-container">
          <div className="mesh-blob-1"></div>
          <div className="mesh-blob-2"></div>
          <div className="mesh-blob-3"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
