'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { useAuth } from './AuthProvider';
import { API_ORIGIN, type ProductListItem } from '@/lib/api';
import { QuickViewModal } from './QuickViewModal';

function formatPKR(value: string | number | null | undefined) {
  if (value == null) return '';
  const n = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  if (Number.isNaN(n)) return String(value);
  return `Rs.${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(n)}`;
}

function renderStars(rating: number) {
  const full = Math.round(rating);
  return '★'.repeat(Math.min(5, Math.max(0, full))) + '☆'.repeat(Math.max(0, 5 - Math.min(5, Math.max(0, full))));
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const buttonVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export function ProductCard({ product, index = 0 }: { product: ProductListItem; index?: number }) {
  const [quickView, setQuickView] = useState(false);
  const [adding, setAdding] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();
  const { token } = useAuth();

  const imgSrc = product.primary_image?.startsWith('http') ? product.primary_image : `${API_ORIGIN}${product.primary_image || ''}`;
  const showSale = Boolean(product.is_on_sale && product.compare_at_price);
  const rating = typeof product.average_rating === 'number' ? product.average_rating : null;
  const reviewsCount = typeof product.reviews_count === 'number' ? product.reviews_count : null;

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
        variants={cardVariants}
        custom={index}
        className="group relative rounded-2xl overflow-hidden bg-white/95 border border-gold-100/70 shadow-gold-border transition-all duration-300"
        whileHover={{ y: -6, rotateX: 2, rotateY: -2, boxShadow: '0 18px 70px rgba(184, 134, 11, 0.20)' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* subtle gradient frame */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute -inset-1 bg-gradient-to-br from-gold-200/50 via-transparent to-gold-500/20 blur-lg" />
        </div>
        <Link href={`/products/${product.id}`} className="block">
          <motion.div
            className="aspect-[3/4] relative overflow-hidden bg-cream-200"
            initial="hidden"
            whileHover="visible"
          >
            {showSale && (
              <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold tracking-wide shadow-lg">
                Sale
              </div>
            )}
            {product.primary_image ? (
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={imgSrc}
                  alt={product.name}
                  fill
                  className="object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  unoptimized={imgSrc.startsWith('http://localhost')}
                />
                {/* shimmer */}
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.4s_ease-in-out_1]" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gold-400 font-serif text-2xl">
                {product.name}
              </div>
            )}
            <motion.div
              variants={overlayVariants}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex flex-col justify-end p-4"
            >
              <motion.div
                className="flex gap-2"
                variants={{
                  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
                }}
              >
                <motion.button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickView(true); }}
                  className="flex-1 py-2.5 rounded-lg border border-gold-400 text-gold-700 bg-white/95 text-sm font-medium hover:bg-gold-50 transition-colors shadow-lg"
                  variants={buttonVariants}
                >
                  Quick view
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={adding || product.stock < 1}
                  className="flex-1 py-2.5 rounded-lg bg-gold-500 text-white text-sm font-medium hover:bg-gold-600 transition-colors disabled:opacity-50 shadow-lg"
                  variants={buttonVariants}
                >
                  {adding ? 'Adding...' : token ? 'Add to cart' : 'Login to add'}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
          <div className="p-4 bg-gradient-to-br from-gold-50 via-gold-100 to-cream-100 border-t border-gold-200/60">
            <p className="text-gold-700 text-sm font-semibold">{product.category_name}</p>
            <h3 className="font-serif text-lg text-charcoal-900 mt-1 group-hover:text-gold-800 transition-colors line-clamp-1">{product.name}</h3>
            {showSale ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-charcoal-400 line-through">{formatPKR(product.compare_at_price)}</span>
                <span className="text-charcoal-800 font-semibold">{formatPKR(product.price)}</span>
              </div>
            ) : (
              <p className="text-charcoal-700 font-semibold mt-2">{formatPKR(product.price)}</p>
            )}
            <div className="mt-2 flex items-center justify-between">
              {rating != null ? (
                <div className="flex items-center gap-2">
                  <span className="text-gold-500 text-sm">{renderStars(rating)}</span>
                  <span className="text-xs text-charcoal-500">{reviewsCount != null ? `(${reviewsCount})` : ''}</span>
                </div>
              ) : (
                <span className="text-xs text-charcoal-500">No reviews yet</span>
              )}
              <span className="text-[11px] text-charcoal-500">Pakistan</span>
            </div>
          </div>
        </Link>
      </motion.article>

      {quickView && (
        <QuickViewModal productId={product.id} onClose={() => setQuickView(false)} />
      )}
    </>
  );
}
