import type { Metadata } from 'next';
import { Playfair_Display, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import { CartProvider } from '@/components/CartProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WhatsAppFloatingButton } from '@/components/WhatsAppFloatingButton';
import { PageTransition } from '@/components/PageTransition';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bridal Jewelry | Luxury Bridal Jewelry Store',
  description: 'Discover elegant bridal jewelry – necklaces, earrings, bracelets, rings, and hair accessories for your special day.',
  openGraph: { title: 'Bridal Jewelry | Luxury Bridal Jewelry Store', description: 'Elegant bridal jewelry for your wedding day.' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${outfit.variable}`}>
      <body className="font-sans min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <WhatsAppFloatingButton />
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
