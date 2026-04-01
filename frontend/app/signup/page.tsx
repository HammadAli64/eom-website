'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] bg-cream-50" />}>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<Record<string, string> | string>('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const addToCartId = searchParams.get('addToCart');
  const { signup } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== passwordConfirm) {
      setError({ password_confirm: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      await signup({
        email,
        username,
        password,
        password_confirm: passwordConfirm,
        first_name: firstName,
        last_name: lastName,
      });
      const productId = addToCartId ? Number(addToCartId) : 0;
      if (productId && !isNaN(productId)) {
        await addToCart(productId, 1);
        router.push(`/products/${productId}`);
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        try {
          const parsed = JSON.parse((err as { message: string }).message);
          setError(typeof parsed === 'object' ? parsed : { error: (err as Error).message });
        } catch {
          setError((err as Error).message);
        }
      } else {
        setError('Signup failed');
      }
    } finally {
      setLoading(false);
    }
  }

  const errObj = typeof error === 'object' && error !== null ? error : {};
  const errStr = typeof error === 'string' ? error : '';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gold-100 to-cream-300 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800')] bg-cover bg-center opacity-25" />
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <div className="text-charcoal-800">
            <motion.h2 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="font-serif text-3xl text-gold-700 mb-4">
              Join us
            </motion.h2>
            <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-charcoal-700">
              Create an account to save your favorites and checkout with ease.
            </motion.p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-cream-50 overflow-y-auto"
      >
        <div className="w-full max-w-md py-8">
          <h1 className="font-serif text-3xl text-gold-700 mb-2">Create account</h1>
          <p className="text-charcoal-600 mb-8">Fill in your details to get started.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {(errStr || Object.keys(errObj).length) ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-600 text-sm bg-red-50 p-3 rounded-md space-y-1">
                {errStr && <p>{errStr}</p>}
                {Object.entries(errObj).map(([k, v]) => (
                  <p key={k}>{Array.isArray(v) ? v[0] : v}</p>
                ))}
              </motion.div>
            ) : null}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">First name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Last name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none" />
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none" placeholder="you@example.com" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Username *</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none" placeholder="username" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Password *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full px-4 py-2.5 rounded-lg border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none" placeholder="••••••••" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Confirm password *</label>
              <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none" placeholder="••••••••" />
            </motion.div>
            <motion.button type="submit" disabled={loading} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="w-full bg-gold-500 text-white py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors disabled:opacity-50 mt-4">
              {loading ? 'Creating account...' : 'Sign up'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-charcoal-600">
            Already have an account? <Link href={addToCartId ? `/login?addToCart=${addToCartId}` : '/login'} className="text-gold-600 hover:text-gold-700 font-medium">Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
