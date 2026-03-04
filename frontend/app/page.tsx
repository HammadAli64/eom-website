'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/ProductCard';
import { products, categories } from '@/lib/api';
import type { ProductListItem, Category } from '@/lib/api';

export default function HomePage() {
  const [featured, setFeatured] = useState<ProductListItem[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const [cats, setCats] = useState<Category[]>([]);
  const [shopItems, setShopItems] = useState<ProductListItem[]>([]);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopCategory, setShopCategory] = useState<string>('');
  const [shopSearch, setShopSearch] = useState('');

  useEffect(() => {
    products.featured().then(setFeatured).catch(() => []).finally(() => setLoadingFeatured(false));
  }, []);

  useEffect(() => {
    categories.list().then(setCats).catch(() => []);
  }, []);

  useEffect(() => {
    setShopLoading(true);
    products
      .list({
        page: 1,
        category: shopCategory ? parseInt(shopCategory, 10) : undefined,
        search: shopSearch || undefined,
      })
      .then((res) => setShopItems(res.results))
      .catch(() => setShopItems([]))
      .finally(() => setShopLoading(false));
  }, [shopCategory, shopSearch]);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-charcoal-900/50" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-4"
        >
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white mb-4 drop-shadow-lg">
            Elegant Bridal Jewelry
          </h1>
          <p className="text-xl md:text-2xl text-cream-200 max-w-2xl mx-auto mb-8">
            Handpicked pieces to make your special day shine
          </p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Link href="/products" className="inline-block px-8 py-4 bg-gold-500 text-white font-medium rounded-lg hover:bg-gold-600 transition-colors shadow-lg">
              Shop the collection
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-serif text-3xl text-gold-700 text-center mb-12">
          Featured pieces
        </motion.h2>
        {loadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-cream-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </motion.div>
        )}
      </section>

      {/* Shop preview with filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-serif text-2xl md:text-3xl text-gold-700 mb-6"
        >
          Explore the collection
        </motion.h2>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0 space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Search</label>
              <input
                type="text"
                value={shopSearch}
                onChange={(e) => setShopSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Category</label>
              <select
                value={shopCategory}
                onChange={(e) => setShopCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none"
              >
                <option value="">All</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-charcoal-500">
              Use search and category filters to quickly find pieces you love.
            </p>
          </aside>
          <div className="flex-1">
            {shopLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-cream-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : shopItems.length === 0 ? (
              <div className="py-12 text-center text-charcoal-600">
                No products found. Try adjusting your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {shopItems.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}
            <div className="mt-6 text-right">
              <Link href="/products" className="text-gold-600 hover:text-gold-700 font-medium text-sm">
                View all products →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-charcoal-900 text-cream-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-serif text-3xl text-gold-400 text-center mb-12">
            What brides say
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: 'The pearl necklace was even more beautiful in person. Perfect for my wedding day.', name: 'Sarah M.' },
              { quote: 'Stunning quality and fast delivery. I got so many compliments!', name: 'Emily L.' },
              { quote: 'Elegant and timeless. Exactly what I was looking for.', name: 'Jessica K.' },
            ].map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-charcoal-800/50 rounded-xl p-6 border border-gold-500/20"
              >
                <p className="text-cream-200 italic">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 text-gold-400 font-medium">— {t.name}</p>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-gold-100 to-cream-300 rounded-2xl p-8 md:p-12 text-center"
        >
          <h2 className="font-serif text-2xl md:text-3xl text-gold-800 mb-2">Stay in the loop</h2>
          <p className="text-charcoal-600 mb-6">Subscribe for new arrivals and exclusive offers.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email" className="flex-1 px-4 py-3 rounded-lg border border-gold-200 focus:border-gold-500 outline-none" />
            <button type="submit" className="px-6 py-3 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors">
              Subscribe
            </button>
          </form>
        </motion.div>
      </section>
    </div>
  );
}
