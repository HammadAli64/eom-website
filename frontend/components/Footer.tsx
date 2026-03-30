'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  const socials = [
    { name: 'WhatsApp', href: 'https://wa.me/923277236384' },
    { name: 'Facebook', href: 'https://facebook.com/' },
    { name: 'Instagram', href: 'https://instagram.com/' },
    { name: 'TikTok', href: 'https://tiktok.com/@' },
  ];

  return (
    <footer className="bg-charcoal-900 text-cream-200 mt-auto">
      {/* Moving banner above footer */}
      <div className="marquee border-t border-white/10">
        <div className="marquee-track py-3">
          {[
            'Customer support on WhatsApp •',
            'Fast delivery across Pakistan •',
            'Premium quality bridal jewelry •',
            'Secure checkout •',
            'New arrivals weekly •',
          ].concat([
            'Customer support on WhatsApp •',
            'Fast delivery across Pakistan •',
            'Premium quality bridal jewelry •',
            'Secure checkout •',
            'New arrivals weekly •',
          ]).map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-6">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-500/80" />
              <span className="text-cream-100/85 text-sm md:text-base font-medium tracking-wide whitespace-nowrap">
                {t}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-xl text-gold-400 mb-4">Bridal Jewelry</h3>
            <p className="text-sm text-cream-300/80">
              Elegant jewelry for your special day. Handpicked pieces to make you shine.
            </p>
            <div className="mt-5">
              <h4 className="font-semibold text-gold-400 mb-3">Follow us</h4>
              <div className="flex items-center gap-3">
                {/* WhatsApp */}
                <a
                  href={socials[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cream-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor" aria-hidden="true">
                    <path d="M19.11 17.37c-.27-.14-1.62-.8-1.87-.89-.25-.09-.43-.14-.61.14-.18.27-.7.89-.86 1.07-.16.18-.32.2-.59.07-.27-.14-1.16-.43-2.2-1.36-.81-.72-1.36-1.62-1.52-1.89-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.48-.84-2.03-.22-.52-.44-.45-.61-.46h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.63 1.12 2.82c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.66.21 1.26.18 1.73.11.53-.08 1.62-.66 1.85-1.3.23-.64.23-1.18.16-1.3-.07-.12-.25-.2-.52-.34zM16.04 27c-1.86 0-3.66-.5-5.24-1.45l-3.66.96.98-3.57A10.88 10.88 0 0 1 5 16.04C5 9.95 9.95 5 16.04 5c2.95 0 5.73 1.15 7.82 3.23A10.97 10.97 0 0 1 27 16.04C27 22.05 22.05 27 16.04 27zm0-20C11.06 7 7 11.06 7 16.04c0 1.83.55 3.6 1.6 5.1l.16.23-.58 2.1 2.16-.57.22.14A9.02 9.02 0 0 0 16.04 25C20.94 25 25 20.94 25 16.04c0-2.4-.94-4.66-2.64-6.36A8.94 8.94 0 0 0 16.04 7z" />
                  </svg>
                </a>
                {/* Facebook */}
                <a
                  href={socials[1].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cream-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                    <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.88h-2.34v6.99A10 10 0 0 0 22 12z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href={socials[2].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cream-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                    <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4.5A5.5 5.5 0 1 1 6.5 14 5.51 5.51 0 0 1 12 8.5zm0 2A3.5 3.5 0 1 0 15.5 14 3.5 3.5 0 0 0 12 10.5zm5.75-3.1a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1z"/>
                  </svg>
                </a>
                {/* TikTok */}
                <a
                  href={socials[3].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cream-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                    <path d="M16.6 5.82a4.8 4.8 0 0 0 3.36 1.35V9.9a7.73 7.73 0 0 1-3.36-.77v6.55a6.09 6.09 0 1 1-6.09-6.09c.37 0 .73.03 1.08.1v2.84a3.27 3.27 0 1 0 1.93 3.16V2h2.98c.1 1.42.67 2.7 1.55 3.82z"/>
                  </svg>
                </a>
              </div>
              <p className="mt-3 text-xs text-cream-300/70">
                Official social links (update URLs as needed).
              </p>
            </div>
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
