'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { admin } from '@/lib/api';
import type { Order, AdminOrdersResponse, AdminOrderFilter } from '@/lib/api';

const FILTER_OPTIONS: { key: AdminOrderFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'sent', label: 'Sent' },
  { key: 'complete', label: 'Complete' },
  { key: 'return', label: 'Return' },
];

export default function AdminOrdersPage() {
  const [data, setData] = useState<AdminOrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AdminOrderFilter>('all');

  useEffect(() => {
    setLoading(true);
    admin
      .orders(filter)
      .then(setData)
      .catch(() => setData({ orders: [], stats: { all: 0, pending: 0, sent: 0, complete: 0, return: 0 } }))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-cream-200 rounded animate-pulse" />
        <div className="h-64 bg-cream-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  const orders: Order[] = data?.orders ?? [];
  const stats = data?.stats;

  return (
    <div>
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-2xl text-charcoal-800 mb-4 md:mb-6">
        Orders
      </motion.h1>

      {/* Filter + stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setFilter(opt.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === opt.key ? 'bg-gold-500 text-white border-gold-500' : 'border-gold-200 text-charcoal-700 hover:bg-gold-50'
              }`}
            >
              {opt.label}
              {stats && (
                <span className="ml-1 text-xs opacity-80">
                  {opt.key === 'all'
                    ? stats.all
                    : opt.key === 'pending'
                      ? stats.pending
                      : opt.key === 'sent'
                        ? stats.sent
                        : opt.key === 'complete'
                          ? stats.complete
                          : stats.return}
                </span>
              )}
            </button>
          ))}
        </div>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-charcoal-700">
            <div className="bg-cream-50 rounded-lg px-3 py-2 border border-gold-100">
              <p className="font-semibold">Pending</p>
              <p>{stats.pending}</p>
            </div>
            <div className="bg-cream-50 rounded-lg px-3 py-2 border border-gold-100">
              <p className="font-semibold">Sent</p>
              <p>{stats.sent}</p>
            </div>
            <div className="bg-cream-50 rounded-lg px-3 py-2 border border-gold-100">
              <p className="font-semibold">Complete</p>
              <p>{stats.complete}</p>
            </div>
            <div className="bg-cream-50 rounded-lg px-3 py-2 border border-gold-100">
              <p className="font-semibold">Return</p>
              <p>{stats.return}</p>
            </div>
          </div>
        )}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-gold-100 shadow-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-50">
                <th className="p-3 font-medium text-charcoal-700 text-left">Order #</th>
                <th className="p-3 font-medium text-charcoal-700 text-left">Customer</th>
                <th className="p-3 font-medium text-charcoal-700 text-left">Total</th>
                <th className="p-3 font-medium text-charcoal-700 text-left">Status</th>
                <th className="p-3 font-medium text-charcoal-700 text-left">Date</th>
                <th className="p-3 font-medium text-charcoal-700 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-charcoal-500">No orders.</td></tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-t border-gold-100 hover:bg-cream-50/50">
                    <td className="p-3 font-medium">{o.order_number}</td>
                    <td className="p-3">{o.shipping_name}</td>
                    <td className="p-3">{o.total}</td>
                    <td className="p-3"><span className="capitalize">{o.status}</span></td>
                    <td className="p-3 text-charcoal-500">{new Date(o.created_at).toLocaleString()}</td>
                    <td className="p-3"><Link href={`/admin/orders/${o.id}`} className="text-gold-600 hover:underline">View</Link></td>
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
