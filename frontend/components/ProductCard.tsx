'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { useAuth } from './AuthProvider';
import type { ProductListItem } from '@/lib/api';
import { QuickViewModal } from './QuickViewModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function ProductCard({ product, index = 0 }: { product: ProductListItem; index?: number }) {
  const [quickView, setQuickView] = useState(false);
  const [adding, setAdding] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();
  const { token } = useAuth();

  const imgSrc = product.primary_image?.startsWith('http') ? product.primary_image : `${API_BASE.replace('/api', '')}${product.primary_image || ''}`;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      router.push(`/login?addToCart=${product.id}`);
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, 1);
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group relative bg-white rounded-xl overflow-hidden shadow-gold-border hover:shadow-gold-border-hover transition-all duration-300"
      >
        <Link href={`/products/${product.id}`} className="block">
          <div className="aspect-[3/4] relative overflow-hidden bg-cream-200 group/img">
            {product.primary_image ? (
              <Image
                src={imgSrc}
                alt={product.name}
                fill
                className="object-contain group-hover/img:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 33vw"
                unoptimized={imgSrc.startsWith('http://localhost')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gold-400 font-serif text-2xl">
                {product.name}
              </div>
            )}
            {/* Overlay and buttons show on hover over the image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickView(true); }}
                  className="flex-1 py-2.5 rounded-lg border border-gold-400 text-gold-700 bg-white/95 text-sm font-medium hover:bg-gold-50 transition-colors shadow-lg"
                >
                  Quick view
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding || product.stock < 1}
                  className="flex-1 py-2.5 rounded-lg bg-gold-500 text-white text-sm font-medium hover:bg-gold-600 transition-colors disabled:opacity-50 shadow-lg"
                >
                  {adding ? 'Adding...' : token ? 'Add to cart' : 'Login to add'}
                </button>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-gold-600 text-sm font-medium">{product.category_name}</p>
            <h3 className="font-serif text-lg text-charcoal-800 mt-1 group-hover:text-gold-700 transition-colors">{product.name}</h3>
            <p className="text-gold-700 font-semibold mt-2">{product.price}</p>
          </div>
        </Link>
      </motion.article>

      {quickView && (
        <QuickViewModal productId={product.id} onClose={() => setQuickView(false)} />
      )}
    </>
  );
}
