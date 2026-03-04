'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token && !loading) router.push('/login');
  }, [token, loading, router]);

  if (!token) return null;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-cream-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cream-50 rounded-2xl p-12 border border-gold-100"
        >
          <div className="text-6xl mb-4">✨</div>
          <h2 className="font-serif text-2xl text-charcoal-800 mb-2">Your cart is empty</h2>
          <p className="text-charcoal-600 mb-8">Add some beautiful pieces to get started.</p>
          <Link href="/products" className="inline-block px-8 py-3 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors">
            Continue shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-3xl text-gold-700 mb-8">
        Your cart
      </motion.h1>

      <div className="space-y-4">
        {cart.items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col sm:flex-row gap-4 bg-white rounded-xl p-4 shadow-gold-border border border-gold-200/50"
          >
            <Link href={`/products/${item.product}`} className="w-full sm:w-24 h-24 relative rounded-lg overflow-hidden bg-cream-200 flex-shrink-0 block">
              {item.product_image ? (
                <Image
                  src={item.product_image.startsWith('http') ? item.product_image : `${API_BASE.replace('/api', '')}${item.product_image}`}
                  alt={item.product_name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gold-400 text-2xl">◆</div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link href={`/products/${item.product}`} className="font-medium text-charcoal-800 hover:text-gold-600 transition-colors">
                {item.product_name}
              </Link>
              <p className="text-gold-700 font-semibold">{item.product_price}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
              <div className="flex items-center border border-gold-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-charcoal-600 hover:bg-gold-50 transition-colors"
                >
                  −
                </button>
                <span className="w-10 h-10 flex items-center justify-center text-sm font-medium border-x border-gold-200">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-charcoal-600 hover:bg-gold-50 transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-gold-700 font-semibold w-20 text-right">{item.subtotal}</p>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Remove"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 p-6 bg-cream-50 rounded-xl border border-gold-100"
      >
        <p className="text-xl font-semibold text-charcoal-800">Total: <span className="text-gold-700">{cart.total}</span></p>
        <Link href="/checkout" className="px-8 py-3 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors">
          Proceed to checkout
        </Link>
      </motion.div>
    </div>
  );
}
