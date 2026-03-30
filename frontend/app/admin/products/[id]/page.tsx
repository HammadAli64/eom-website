'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { admin } from '@/lib/api';
import type { ProductDetail, ProductImage } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';

export default function AdminEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOnSale, setIsOnSale] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || isNaN(id)) return;
    admin.categories().then(setCategories).catch(() => []);
  }, [id]);

  useEffect(() => {
    if (!id || isNaN(id)) return;
    admin.product(id).then((data) => {
      setProduct(data);
      setName(data.name);
      setSlug(data.slug);
      setDescription(data.description || '');
      setPrice(data.price);
      setCompareAtPrice(data.compare_at_price || '');
      setStock(String(data.stock ?? 0));
      setCategory(String(data.category));
      setIsFeatured(data.is_featured ?? false);
      setIsOnSale(Boolean(data.is_on_sale));
    }).catch(() => setProduct(null));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await admin.productUpdate(id, {
        name,
        slug,
        description,
        price: String(parseFloat(price) || 0),
        is_on_sale: isOnSale,
        compare_at_price: isOnSale && compareAtPrice ? String(parseFloat(compareAtPrice) || 0) : null,
        category: parseInt(category, 10),
        stock: parseInt(stock, 10) || 0,
        is_featured: isFeatured,
      });
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !id) return;
    setUploadingImages(true);
    setError('');
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));
      const updated = await admin.productAddImages(id, formData);
      setProduct(updated);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleDeleteImage(imageId: number) {
    if (!id) return;
    setDeletingId(imageId);
    try {
      await admin.productDeleteImage(id, imageId);
      setProduct((p) => p ? { ...p, images: p.images?.filter((i) => i.id !== imageId) || [] } : null);
    } finally {
      setDeletingId(null);
    }
  }

  if (!product && !name) return <div className="h-64 bg-cream-200 rounded-xl animate-pulse" />;

  return (
    <div>
      <Link href="/admin/products" className="text-gold-600 hover:underline text-sm mb-4 inline-block">← Back to products</Link>
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-2xl text-charcoal-800 mb-8">
        Edit product
      </motion.h1>
      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1">Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1">Slug</label>
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none" />
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
          <label className="block text-sm font-medium text-charcoal-700 mb-2">Images</label>
          {product?.images && product.images.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {product.images.map((img: ProductImage) => (
                <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gold-200 bg-cream-100">
                  <Image src={img.image.startsWith('http') ? img.image : `${API_BASE}${img.image}`} alt="" fill className="object-contain" unoptimized />
                  <button type="button" onClick={() => handleDeleteImage(img.id)} disabled={deletingId === img.id} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 disabled:opacity-50">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleAddImages}
            disabled={uploadingImages}
            className="w-full text-sm text-charcoal-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gold-100 file:text-gold-800 file:font-medium disabled:opacity-50"
          />
          {uploadingImages && <p className="mt-1 text-sm text-charcoal-500">Uploading...</p>}
        </div>
        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={loading} className="px-6 py-2 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save changes'}
          </button>
          <Link href="/admin/products" className="px-6 py-2 border border-gold-300 text-gold-700 rounded-lg font-medium hover:bg-gold-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
