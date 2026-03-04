'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (!token && pathname !== '/admin' && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [mounted, pathname, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const isLogin = pathname === '/admin/login';

  if (isLogin) {
    return <div className="min-h-screen bg-cream-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col md:flex-row">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`w-56 bg-charcoal-900 text-cream-100 flex flex-col fixed md:static h-full z-50 transform transition-transform duration-200 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 md:p-6 border-b border-charcoal-700 flex items-center justify-between">
          <Link href="/admin/dashboard" className="font-serif text-xl text-gold-400">Admin</Link>
          <button type="button" onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-cream-300 hover:text-white" aria-label="Close menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <Link href="/admin/dashboard" className={`block px-4 py-2 rounded-lg transition-colors ${pathname === '/admin/dashboard' ? 'bg-gold-500/20 text-gold-400' : 'hover:bg-charcoal-800'}`}>
            Dashboard
          </Link>
          <Link href="/admin/orders" className={`block px-4 py-2 rounded-lg transition-colors ${pathname?.startsWith('/admin/orders') ? 'bg-gold-500/20 text-gold-400' : 'hover:bg-charcoal-800'}`}>
            Orders
          </Link>
          <Link href="/admin/products" className={`block px-4 py-2 rounded-lg transition-colors ${pathname?.startsWith('/admin/products') ? 'bg-gold-500/20 text-gold-400' : 'hover:bg-charcoal-800'}`}>
            Products
          </Link>
          <Link href="/admin/categories" className={`block px-4 py-2 rounded-lg transition-colors ${pathname?.startsWith('/admin/categories') ? 'bg-gold-500/20 text-gold-400' : 'hover:bg-charcoal-800'}`}>
            Categories
          </Link>
          <Link href="/admin/users" className={`block px-4 py-2 rounded-lg transition-colors ${pathname === '/admin/users' ? 'bg-gold-500/20 text-gold-400' : 'hover:bg-charcoal-800'}`}>
            Users
          </Link>
        </nav>
        <div className="p-4 border-t border-charcoal-700">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('adminToken');
              router.push('/admin/login');
            }}
            className="block w-full text-left px-4 py-2 rounded-lg hover:bg-charcoal-800 text-cream-300"
          >
            Logout
          </button>
          <Link href="/" className="block mt-2 px-4 py-2 rounded-lg hover:bg-charcoal-800 text-cream-300 text-sm">
            ← Back to store
          </Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 md:ml-0">
        <button type="button" onClick={() => setSidebarOpen(true)} className="md:hidden mb-4 p-2 rounded-lg bg-charcoal-800 text-cream-100" aria-label="Open menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        {children}
      </main>
    </div>
  );
}
