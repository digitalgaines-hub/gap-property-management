import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'G&A Property Management | Premium Properties in Richmond, KY',
  description:
    'Discover premium commercial and residential properties managed by G&A Property Management in Richmond, Kentucky. Professional management since 2010.',
  keywords:
    'property management, commercial real estate, residential rentals, Richmond Kentucky',
  openGraph: {
    title: 'G&A Property Management',
    description: 'Premium properties in Richmond, Kentucky',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}