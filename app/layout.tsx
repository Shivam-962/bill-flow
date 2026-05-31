import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BillFlow ERP - Smart Billing, Inventory & Customer Management',
  description: 'Enterprise-grade POS Billing and Stock Management SaaS for grocery, medical, fashion, and retail shops.',
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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
