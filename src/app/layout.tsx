import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Zash Management',
  description: 'Premium Tour & Expense Management',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased min-h-screen bg-[#fafafa] text-zinc-900`}>
        <Providers>
          <Navbar />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
