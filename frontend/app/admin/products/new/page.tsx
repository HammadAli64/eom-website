'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { admin } from '@/lib/api';
import type { Category } from '@/lib/api';

export default function AdminNewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOnSale, setIsOnSale] = useState(false);
  /** 5 slots: index 0 = required, 1–4 = optional */
  const [imageSlots, setImageSlots] = useState<(File | null)[]>([null, null, null, null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    admin.categories().then(setCategories).catch(() => []);
  }, []);

  function setSlot(index: number, file: File | null) {
    setImageSlots((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!imageSlots[0]) {
      setError('Image 1 (main image) is required.');
      return;
    }
    const files = imageSlots.filter((f): f is File => f != null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('slug', slug || name.toLowerCase().replace(/\s+/g, '-'));
      formData.append('description', description);
      formData.append('price', String(parseFloat(price) || 0));
      formData.append('is_on_sale', isOnSale ? 'true' : 'false');
      if (isOnSale && compareAtPrice) {
        formData.append('compare_at_price', String(parseFloat(compareAtPrice) || 0));
      }
      formData.append('category', category);
      formData.append('stock', String(parseInt(stock, 10) || 0));
      formData.append('is_featured', isFeatured ? 'true' : 'false');
      files.forEach((file) => formData.append('images', file));
      await admin.productCreate(formData);
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Link href="/admin/products" className="text-gold-600 hover:underline text-sm mb-4 inline-block">← Back to products</Link>
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-2xl text-charcoal-800 mb-8">
        Add product
      </motion.h1>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1">Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1">Slug</label>
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from name" className="w-full px-4 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1">Description *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} className="w-full px-4 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">Price *</label>
            <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">Stock</label>
            <input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 items-end">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="sale" checked={isOnSale} onChange={(e) => setIsOnSale(e.target.checked)} className="rounded border-gold-300" />
            <label htmlFor="sale" className="text-sm text-charcoal-700">On sale</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">Cross price</label>
            <input
              type="number"
              step="0.01"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              disabled={!isOnSale}
              placeholder="optional"
              className="w-full px-4 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none disabled:opacity-60"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1">Category *</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none">
            <option value="">Select</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="feat" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded border-gold-300" />
          <label htmlFor="feat" className="text-sm text-charcoal-700">Featured product</label>
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-2">Images (1 required, 4 optional)</label>
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="text-sm text-charcoal-600 w-32 shrink-0">
                  Image {i + 1} {i === 0 ? <span className="text-red-600">*</span> : '(optional)'}
                </label>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSlot(i, e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-charcoal-600 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-gold-100 file:text-gold-800 file:font-medium file:text-sm"
                  />
                  {imageSlots[i] && (
                    <span className="text-xs text-charcoal-500 shrink-0">{imageSlots[i]?.name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-charcoal-500">First image is the main product image. You can add up to 4 more optional images.</p>
        </div>
        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={loading} className="px-6 py-2 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 disabled:opacity-50">
            {loading ? 'Saving...' : 'Create product'}
          </button>
          <Link href="/admin/products" className="px-6 py-2 border border-gold-300 text-gold-700 rounded-lg font-medium hover:bg-gold-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
