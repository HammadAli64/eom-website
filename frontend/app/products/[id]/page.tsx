'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { API_ORIGIN, products } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import type { ProductDetail, ProductListItem } from '@/lib/api';

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<ProductListItem[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const router = useRouter();
  const { addToCart } = useCart();
  const { token } = useAuth();

  useEffect(() => {
    if (!id || isNaN(id)) return;
    products.get(id).then(setProduct).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!product?.category) return;
    products
      .list({ category: product.category, page: 1 })
      .then((res) => {
        const others = (res.results || []).filter((p) => p.id !== product.id);
        setRelated(others.slice(0, 4));
      })
      .catch(() => setRelated([]));
  }, [product?.id, product?.category]);

  const images = product?.images?.length
    ? product.images.slice(0, 5) // main + up to 4 optional
    : (product?.primary_image ? [{ image: product.primary_image, alt_text: product.name, order: 0 }] : []);
  const mainImage = images[selectedImageIndex]?.image || product?.primary_image;

  async function handleAddToCart() {
    if (!product) return;
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square bg-cream-200 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-cream-200 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-cream-200 rounded w-1/4 animate-pulse" />
            <div className="h-24 bg-cream-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl text-charcoal-800">Product not found</h2>
        <Link href="/products" className="mt-4 inline-block text-gold-600 hover:text-gold-700">Back to shop</Link>
      </div>
    );
  }

  const imgUrl = (url: string) => (url.startsWith('http') ? url : `${API_ORIGIN}${url}`);
  const computedAvg =
    product.reviews && product.reviews.length
      ? product.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / product.reviews.length
      : null;
  const rating = typeof product.average_rating === 'number' ? product.average_rating : computedAvg;
  const ratingStars = rating == null ? '' : '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid md:grid-cols-2 gap-8 lg:gap-12"
      >
        <div>
          <div className="aspect-square relative rounded-2xl overflow-hidden bg-cream-200 shadow-gold-border">
            {mainImage ? (
              <Image
                src={imgUrl(typeof mainImage === 'string' ? mainImage : (mainImage as { image: string }).image)}
                alt={product.name}
                fill
                className="object-contain"
                priority
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-serif text-2xl text-gold-500">{product.name}</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImageIndex(i)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === i ? 'border-gold-500' : 'border-transparent hover:border-gold-300'
                  }`}
                >
                  <Image
                    src={imgUrl(typeof img === 'object' && 'image' in img ? img.image : (img as string))}
                    alt={(typeof img === 'object' && 'alt_text' in img ? img.alt_text : '') || product.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-gold-600 font-medium">{product.category_name}</p>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal-800 mt-1">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            {rating != null ? (
              <>
                <span className="text-gold-500">{ratingStars}</span>
                <span className="text-sm text-charcoal-600">{rating.toFixed(1)} / 5</span>
                <span className="text-sm text-charcoal-500">
                  ({product.reviews?.length ?? 0} reviews)
                </span>
              </>
            ) : (
              <span className="text-sm text-charcoal-500">No reviews yet</span>
            )}
          </div>
          <p className="text-2xl text-gold-700 font-semibold mt-4">{product.price}</p>
          <p className="text-charcoal-600 mt-6 leading-relaxed">{product.description}</p>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || product.stock < 1}
            className="mt-8 w-full md:w-auto px-8 py-4 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors disabled:opacity-50 min-w-[200px]"
          >
            {adding ? 'Adding...' : product.stock < 1 ? 'Out of stock' : token ? 'Add to cart' : 'Login to add to cart'}
          </button>

          <div className="mt-12 pt-8 border-t border-gold-200">
            <h3 className="font-serif text-xl text-charcoal-800 mb-4">Reviews</h3>
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map((r) => (
                  <div key={r.id} className="bg-cream-50 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gold-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      <span className="text-sm text-charcoal-500">{r.user_email}</span>
                    </div>
                    {r.comment && <p className="mt-2 text-charcoal-600 text-sm">{r.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-charcoal-500">No reviews yet.</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Related by category */}
      <section className="mt-16 pt-12 border-t border-gold-100">
        <h2 className="font-serif text-2xl text-gold-700 mb-6">More from {product.category_name}</h2>
        {related.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {related.map((p, i) => (
              <motion.div
                key={p.id}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                }}
              >
                <ProductCard product={p} index={i} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-charcoal-500">
            Browse more in <Link href="/products" className="text-gold-600 hover:underline">Shop</Link>.
          </p>
        )}
      </section>
    </div>
  );
}
