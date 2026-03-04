'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { admin } from '@/lib/api';
import type { ProductListItem } from '@/lib/api';
import type { Category } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.products().then(setProducts).catch(() => []).finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await admin.productDelete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-cream-200 rounded animate-pulse" />
        <div className="h-64 bg-cream-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-2xl text-charcoal-800">
          Products
        </motion.h1>
        <Link href="/admin/products/new" className="px-4 py-2 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors">
          Add product
        </Link>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-gold-100 shadow-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-50">
                <th className="p-3 font-medium text-charcoal-700 text-left">Image</th>
                <th className="p-3 font-medium text-charcoal-700 text-left">Name</th>
                <th className="p-3 font-medium text-charcoal-700 text-left">Category</th>
                <th className="p-3 font-medium text-charcoal-700 text-left">Price</th>
                <th className="p-3 font-medium text-charcoal-700 text-left">Stock</th>
                <th className="p-3 font-medium text-charcoal-700 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-charcoal-500">No products. <Link href="/admin/products/new" className="text-gold-600">Add one</Link>.</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-t border-gold-100 hover:bg-cream-50/50">
                    <td className="p-3">
                      {p.primary_image ? (
                        <div className="w-12 h-12 relative rounded overflow-hidden bg-cream-200">
                          <Image src={p.primary_image.startsWith('http') ? p.primary_image : `${API_BASE.replace('/api', '')}${p.primary_image}`} alt="" fill className="object-cover" unoptimized />
                        </div>
                      ) : <span className="text-charcoal-400">—</span>}
                    </td>
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">{p.category_name}</td>
                    <td className="p-3">{p.price}</td>
                    <td className="p-3">{p.stock}</td>
                    <td className="p-3 flex gap-2">
                      <Link href={`/admin/products/${p.id}`} className="text-gold-600 hover:underline">Edit</Link>
                      <button type="button" onClick={() => handleDelete(p.id, p.name)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
