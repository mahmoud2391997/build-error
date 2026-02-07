import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zenith - Multi-Tenant Management System',
  description: 'Comprehensive multi-tenant management system for businesses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-['Noto_Sans_Arabic'] bg-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
