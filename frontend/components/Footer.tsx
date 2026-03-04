'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-charcoal-900 text-cream-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-xl text-gold-400 mb-4">Bridal Jewelry</h3>
            <p className="text-sm text-cream-300/80">
              Elegant jewelry for your special day. Handpicked pieces to make you shine.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gold-400 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-gold-300 transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-gold-300 transition-colors">Shop</Link></li>
              <li><Link href="/cart" className="hover:text-gold-300 transition-colors">Cart</Link></li>
              <li><Link href="/admin" className="hover:text-gold-300 transition-colors">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gold-400 mb-4">Contact</h4>
            <p className="text-sm text-cream-300/80">hadich5066@gmail.com</p>
            <p className="text-sm text-cream-300/80 mt-1">0327-7236384</p>
          </div>
        </div>
        <div className="border-t border-charcoal-700 mt-8 pt-8 text-center text-sm text-cream-300/60">
          © {new Date().getFullYear()} Bridal Jewelry. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
