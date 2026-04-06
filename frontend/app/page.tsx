'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/ProductCard';
import { products, categories } from '@/lib/api';
import type { ProductListItem, Category } from '@/lib/api';

const titleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      staggerChildren: 0.2,
    },
  },
};

const titleChildVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

export default function HomePage() {
  const [featured, setFeatured] = useState<ProductListItem[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  const [cats, setCats] = useState<Category[]>([]);
  const [shopItems, setShopItems] = useState<ProductListItem[]>([]);
  const [shopLoading, setShopLoading] = useState(true);
  const [shopCategory, setShopCategory] = useState<string>('');
  const [shopSearch, setShopSearch] = useState('');
  const [shopMinPrice, setShopMinPrice] = useState('');
  const [shopMaxPrice, setShopMaxPrice] = useState('');

  useEffect(() => {
    products.featured().then(setFeatured).catch((err) => {
      console.error('Featured products API error:', err);
      setFeatured([]);
    }).finally(() => setLoadingFeatured(false));
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
        min_price: shopMinPrice ? parseFloat(shopMinPrice) : undefined,
        max_price: shopMaxPrice ? parseFloat(shopMaxPrice) : undefined,
      })
      .then((res) => setShopItems(res.results))
      .catch((err) => {
        console.error('Products list API error:', err);
        setShopItems([]);
      })
      .finally(() => setShopLoading(false));
  }, [shopCategory, shopSearch, shopMinPrice, shopMaxPrice]);

  return (
    <div className="bg-cream-50">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-charcoal-900/60" />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={titleVariants}
          className="relative z-10 text-center text-white px-4"
        >
          <motion.h1 variants={titleChildVariants} className="font-serif font-extrabold tracking-tight text-4xl md:text-6xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-white to-gold-300 mb-4 drop-shadow-lg">
            Elegant Bridal Jewelry
          </motion.h1>
          <motion.p variants={titleChildVariants} className="text-xl md:text-2xl text-cream-200 max-w-2xl mx-auto mb-8">
            Handpicked pieces to make your special day shine
          </motion.p>
          <motion.div variants={titleChildVariants}>
            <Link href="/products" className="inline-block px-8 py-4 bg-gold-500 text-white font-medium rounded-lg hover:bg-gold-600 transition-colors shadow-lg">
              Shop the collection
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Moving banners */}
      <section className="bg-charcoal-900">
        <div className="marquee border-y border-white/10">
          <div className="marquee-track py-3">
            {[
              'Premium bridal sets •',
              'Handcrafted finish •',
              'Fast delivery across Pakistan •',
              'New arrivals weekly •',
              'Wedding-ready sparkle •',
              'Trusted by brides •',
            ].concat([
              'Premium bridal sets •',
              'Handcrafted finish •',
              'Fast delivery across Pakistan •',
              'New arrivals weekly •',
              'Wedding-ready sparkle •',
              'Trusted by brides •',
            ]).map((t, i) => (
              <div key={i} className="flex items-center gap-3 px-6">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-500/80" />
                <span className="text-cream-100/85 text-sm md:text-base font-medium tracking-wide whitespace-nowrap">
                  {t}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-16 md:py-20">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="font-serif font-extrabold tracking-tight text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-gold-500 via-gold-700 to-gold-500 text-center mb-10">
          Featured pieces
        </motion.h2>
        {loadingFeatured ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-cream-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className="text-center text-charcoal-500">No featured items right now.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-white shadow-luxury border border-gold-100/60 p-4 md:p-5 mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold tracking-wide text-charcoal-700 mb-1">SEARCH</label>
              <input
                type="text"
                value={shopSearch}
                onChange={(e) => setShopSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200/60 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold tracking-wide text-charcoal-700 mb-1">CATEGORY</label>
              <select
                value={shopCategory}
                onChange={(e) => setShopCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200/60 outline-none transition-all bg-white"
              >
                <option value="">All</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold tracking-wide text-charcoal-700 mb-1">MIN</label>
              <input
                type="number"
                value={shopMinPrice}
                onChange={(e) => setShopMinPrice(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200/60 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold tracking-wide text-charcoal-700 mb-1">MAX</label>
              <input
                type="number"
                value={shopMaxPrice}
                onChange={(e) => setShopMaxPrice(e.target.value)}
                placeholder="Any"
                className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200/60 outline-none transition-all"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-5">
              <button
                type="button"
                onClick={() => { setShopSearch(''); setShopCategory(''); setShopMinPrice(''); setShopMaxPrice(''); }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gold-500 text-white font-semibold hover:bg-gold-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </motion.div>

        <div className="flex-1">
            {shopLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-cream-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : shopItems.length === 0 ? (
              <div className="py-12 text-center text-charcoal-600">
                No products found. Try adjusting your filters.
              </div>
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8"
              >
                {shopItems.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </motion.div>
            )}
            <div className="mt-8 text-right">
              <Link href="/products" className="text-gold-600 hover:text-gold-700 font-medium group">
                View all products <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
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
              { quote: 'The Bridal Set was even more beautiful in person. Perfect for my wedding day.', name: 'Sarah Jabeen' },
              { quote: 'Stunning quality and fast delivery. I got so many compliments!', name: 'Ammara Zameer' },
              { quote: 'Elegant and timeless. Exactly what I was looking for.', name: 'Laiba' },
            ].map((t, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
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
          viewport={{ once: true, amount: 0.5 }}
          className="bg-gradient-to-br from-gold-100 to-cream-300 rounded-2xl p-8 md:p-12 text-center shadow-luxury"
        >
          <h2 className="font-serif text-2xl md:text-3xl text-gold-800 mb-2">Stay in the loop</h2>
          <p className="text-charcoal-600 mb-6">Subscribe for new arrivals and exclusive offers.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email" className="flex-1 px-4 py-3 rounded-lg border border-gold-200 focus:border-gold-500 outline-none transition-colors" />
            <button type="submit" className="px-6 py-3 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors">
              Subscribe
            </button>
          </form>
        </motion.div>
      </section>
    </div>
  );
}
