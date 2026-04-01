'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ORIGIN, products } from '@/lib/api';
import type { ProductDetail } from '@/lib/api';

export function QuickViewModal({ productId, onClose }: { productId: number; onClose: () => void }) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    products.get(productId).then(setProduct).catch(() => onClose()).finally(() => setLoading(false));
  }, [productId, onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {loading && <div className="p-12 text-center text-charcoal-500">Loading...</div>}
          {product && !loading && (
            <div className="p-6">
              <div className="flex justify-end">
                <button type="button" onClick={onClose} className="p-2 text-charcoal-500 hover:text-charcoal-800" aria-label="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="aspect-square relative rounded-lg overflow-hidden bg-cream-200 mb-4">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0].image.startsWith('http') ? product.images[0].image : `${API_ORIGIN}${product.images[0].image}`}
                    alt={product.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                ) : product.primary_image ? (
                  <Image src={product.primary_image.startsWith('http') ? product.primary_image : `${API_ORIGIN}${product.primary_image}`} alt={product.name} fill className="object-contain" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gold-400 font-serif text-2xl">{product.name}</div>
                )}
              </div>
              <h3 className="font-serif text-xl text-charcoal-800">{product.name}</h3>
              <p className="text-gold-700 font-semibold mt-1">{product.price}</p>
              <p className="text-charcoal-600 text-sm mt-2 line-clamp-3">{product.description}</p>
              <Link href={`/products/${product.id}`} onClick={onClose} className="mt-4 inline-block w-full text-center py-3 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors">
                View full details
              </Link>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
