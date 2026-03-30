'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] bg-cream-50" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const addToCartId = searchParams.get('addToCart');
  const { login } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const productId = addToCartId ? Number(addToCartId) : 0;
      if (productId && !isNaN(productId)) {
        await addToCart(productId, 1);
        router.push(`/products/${productId}`);
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gold-100 to-cream-300 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <div className="text-charcoal-800">
            <motion.h2 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="font-serif text-3xl text-gold-700 mb-4">
              Welcome back
            </motion.h2>
            <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-charcoal-700">
              Sign in to continue shopping for your perfect bridal jewelry.
            </motion.p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-cream-50"
      >
        <div className="w-full max-w-md">
          <h1 className="font-serif text-3xl text-gold-700 mb-2">Login</h1>
          <p className="text-charcoal-600 mb-8">Enter your details to access your account.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </motion.p>
            )}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-2">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-all outline-none"
                placeholder="you@example.com"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal-700 mb-2">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-all outline-none"
                placeholder="••••••••"
              />
              <div className="mt-2 text-right">
                <Link href="/forgot-password" className="text-sm text-gold-700 hover:text-gold-800 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 text-white py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-charcoal-600">
            Don&apos;t have an account?{' '}
            <Link href={addToCartId ? `/signup?addToCart=${addToCartId}` : '/signup'} className="text-gold-600 hover:text-gold-700 font-medium">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
