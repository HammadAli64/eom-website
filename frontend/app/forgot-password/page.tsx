'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { auth } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function handleRequestOTP(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await auth.passwordResetRequest(email);
      setInfo('If this email exists, we sent a 6-digit code. Check your inbox.');
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const res = await auth.passwordResetConfirm({
        email,
        otp,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      localStorage.setItem('token', res.token);
      setInfo('Password updated. You are now logged in.');
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8 bg-cream-50">
      <div className="w-full max-w-md">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-3xl text-gold-700 mb-2">
          Forgot password
        </motion.h1>
        <p className="text-charcoal-600 mb-8">
          Enter your email to receive a one-time code, then set a new password.
        </p>

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-4">{error}</p>}
        {info && <p className="text-green-700 text-sm bg-green-50 p-3 rounded-md mb-4">{info}</p>}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-all outline-none"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 text-white py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">OTP</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                className="w-full px-4 py-3 rounded-lg border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-all outline-none tracking-widest"
                placeholder="123456"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Confirm password</label>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-all outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 text-white py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Reset password'}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-3 rounded-lg border border-gold-300 text-gold-700 font-medium hover:bg-gold-50 transition-colors"
            >
              Send a new code
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-charcoal-600">
          Back to <Link href="/login" className="text-gold-600 hover:text-gold-700 font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}

