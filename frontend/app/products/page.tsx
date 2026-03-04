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
      .catch(() => setData({ results: [], count: 0, next: null, previous: null }))
      .finally(() => setLoading(false));
  }, [page, category, minPrice, maxPrice, sort, search]);

  const totalPages = Math.ceil(data.count / 12) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-3xl md:text-4xl text-gold-700 mb-8">
        Shop
      </motion.h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0 space-y-6">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="w-full px-3 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none"
            >
              <option value="">All</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Price range</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Sort</label>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none"
            >
              <option value="">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </aside>

        <div className="flex-1">
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
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
    </div>
  );
}
