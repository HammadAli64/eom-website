'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/ProductCard';
import { products, categories } from '@/lib/api';
import type { ProductListItem } from '@/lib/api';
import type { Category } from '@/lib/api';

export default function ProductsPage() {
  const [data, setData] = useState<{ results: ProductListItem[]; count: number; next: string | null; previous: string | null }>({ results: [], count: 0, next: null, previous: null });
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sort, setSort] = useState<string>('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    categories.list().then(setCats).catch(() => []);
  }, []);

  useEffect(() => {
    setLoading(true);
    products
      .list({
        page,
        category: category ? parseInt(category, 10) : undefined,
        min_price: minPrice ? parseFloat(minPrice) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        sort: sort || undefined,
        search: search || undefined,
      })
      .then((res) => setData({ results: res.results, count: res.count, next: res.next, previous: res.previous }))
      .catch((err) => {
        console.error('Products list API error:', err);
        setData({ results: [], count: 0, next: null, previous: null });
      })
      .finally(() => setLoading(false));
  }, [page, category, minPrice, maxPrice, sort, search]);

  const totalPages = Math.ceil(data.count / 12) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-serif font-extrabold tracking-tight text-3xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-gold-500 via-gold-700 to-gold-500 mb-8">
        Shop
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white shadow-luxury border border-gold-100/60 p-4 md:p-5 mb-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 items-end">
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs font-extrabold tracking-wide text-charcoal-700 mb-1">SEARCH</label>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200/60 outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-1 lg:col-span-1">
            <label className="block text-xs font-extrabold tracking-wide text-charcoal-700 mb-1">CATEGORY</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200/60 outline-none transition-all bg-white"
            >
              <option value="">All</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1 lg:col-span-1">
            <label className="block text-xs font-extrabold tracking-wide text-charcoal-700 mb-1">MIN</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
              className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200/60 outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-1 lg:col-span-1">
            <label className="block text-xs font-extrabold tracking-wide text-charcoal-700 mb-1">MAX</label>
            <input
              type="number"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
              className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200/60 outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-extrabold tracking-wide text-charcoal-700 mb-1">SORT</label>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="w-full px-4 py-3 rounded-xl border border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200/60 outline-none transition-all bg-white"
            >
              <option value="">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-6">
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategory('');
                setMinPrice('');
                setMaxPrice('');
                setSort('');
                setPage(1);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gold-500 text-white font-semibold hover:bg-gold-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </motion.div>

      <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] bg-cream-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : data.results.length === 0 ? (
            <div className="text-center py-16 text-charcoal-600">
              <p className="text-lg">No products found.</p>
            </div>
          ) : (
            <>
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {data.results.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </motion.div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!data.previous}
                    className="px-4 py-2 rounded-lg border border-gold-300 text-gold-700 disabled:opacity-50 hover:bg-gold-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-charcoal-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={!data.next}
                    className="px-4 py-2 rounded-lg border border-gold-300 text-gold-700 disabled:opacity-50 hover:bg-gold-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
}
