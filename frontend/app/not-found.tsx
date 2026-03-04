'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-8xl font-serif text-gold-400 mb-4">404</p>
        <h1 className="font-serif text-2xl text-charcoal-800 mb-2">Page not found</h1>
        <p className="text-charcoal-500 mb-8">The page you’re looking for doesn’t exist or was moved.</p>
        <Link href="/" className="inline-block px-6 py-3 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors">
          Back to home
        </Link>
      </motion.div>
    </div>
  );
}
