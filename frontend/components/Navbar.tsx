'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { useCart } from './CartProvider';
import { useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return null;

  const cartCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-cream-100/95 backdrop-blur border-b border-gold-200/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="font-serif text-xl md:text-2xl text-gold-700 hover:text-gold-600 transition-colors">
            Bridal Jewelry
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors ${
                  pathname === link.href ? 'text-gold-600' : 'text-charcoal-800 hover:text-gold-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/cart" className="relative p-2 text-charcoal-800 hover:text-gold-600 transition-colors" aria-label={`Cart, ${cartCount} items`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-gold-500 text-white text-xs font-medium">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <span className="text-charcoal-700 font-medium truncate max-w-[120px] sm:max-w-[180px]" title={user.email}>
                  {user.username || user.email?.split('@')[0] || 'Account'}
                </span>
                <button onClick={logout} className="text-charcoal-700 hover:text-gold-600 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-charcoal-700 hover:text-gold-600 transition-colors">Login</Link>
                <Link href="/signup" className="bg-gold-500 text-white px-4 py-2 rounded-md hover:bg-gold-600 transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          <button
            className="md:hidden p-2 text-charcoal-800"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden flex flex-col gap-4 pb-4"
            >
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="text-charcoal-800 hover:text-gold-600">
                  {link.label}
                </Link>
              ))}
              <Link href="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-charcoal-800 hover:text-gold-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              {user ? (
                <>
                  <span className="text-charcoal-600 text-sm">Logged in as <strong>{user.username || user.email?.split('@')[0] || 'Account'}</strong></span>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="text-charcoal-800 hover:text-gold-600">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                </>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
