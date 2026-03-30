'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { admin } from '@/lib/api';
import type { AdminDashboard } from '@/lib/api';

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState('');
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState('');

  useEffect(() => {
    admin.dashboard().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    admin.storeSettings().then((s) => setDeliveryCharge(String(s.delivery_charge))).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-cream-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-cream-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <p className="text-red-600">Failed to load dashboard.</p>;
  }

  const cards = [
    { label: 'Total orders', value: data.total_orders, color: 'bg-gold-500/10 text-gold-700 border-gold-200' },
    { label: 'Total revenue', value: data.total_revenue.toFixed(2), color: 'bg-gold-500/10 text-gold-700 border-gold-200' },
    { label: 'Pending orders', value: data.pending_orders, color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
    { label: 'Orders (30 days)', value: data.orders_last_30_days, color: 'bg-cream-200 text-charcoal-700 border-cream-300' },
  ];

  return (
    <div>
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-2xl text-charcoal-800 mb-8">
        Dashboard
      </motion.h1>

      <div className="bg-white rounded-xl border border-gold-100 shadow-luxury p-6 mb-10">
        <h2 className="font-serif text-lg text-charcoal-800 mb-4">Store settings</h2>
        {deliveryError && <p className="text-sm text-red-600 mb-3">{deliveryError}</p>}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-extrabold tracking-wide text-charcoal-700 mb-1">DELIVERY CHARGE</label>
            <input
              type="number"
              step="1"
              value={deliveryCharge}
              onChange={(e) => setDeliveryCharge(e.target.value)}
              className="w-48 px-4 py-2.5 rounded-xl border border-gold-200 focus:border-gold-500 outline-none"
            />
          </div>
          <button
            type="button"
            disabled={savingDelivery}
            onClick={async () => {
              setSavingDelivery(true);
              setDeliveryError('');
              try {
                const res = await admin.storeSettingsUpdate(String(Number(deliveryCharge) || 0));
                setDeliveryCharge(String(res.delivery_charge));
              } catch (e) {
                setDeliveryError(e instanceof Error ? e.message : 'Failed to save');
              } finally {
                setSavingDelivery(false);
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-gold-500 text-white font-semibold hover:bg-gold-600 disabled:opacity-50"
          >
            {savingDelivery ? 'Saving...' : 'Save'}
          </button>
        </div>
        <p className="text-xs text-charcoal-500 mt-3">This charge is used for order totals and emails.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl border p-6 ${card.color}`}
          >
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            <p className="text-2xl font-semibold mt-1">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-gold-100 shadow-luxury overflow-hidden">
        <div className="p-4 border-b border-gold-100 flex justify-between items-center">
          <h2 className="font-serif text-lg text-charcoal-800">Recent orders</h2>
          <Link href="/admin/orders" className="text-gold-600 hover:text-gold-700 text-sm font-medium">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-50 text-left">
                <th className="p-3 font-medium text-charcoal-700">Order #</th>
                <th className="p-3 font-medium text-charcoal-700">Customer</th>
                <th className="p-3 font-medium text-charcoal-700">Total</th>
                <th className="p-3 font-medium text-charcoal-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_orders?.length ? data.recent_orders.map((o) => (
                <tr key={o.id} className="border-t border-gold-100 hover:bg-cream-50/50">
                  <td className="p-3"><Link href={`/admin/orders/${o.id}`} className="text-gold-600 hover:underline">{o.order_number}</Link></td>
                  <td className="p-3">{o.shipping_name}</td>
                  <td className="p-3 font-medium">{o.total}</td>
                  <td className="p-3 text-charcoal-500">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-6 text-center text-charcoal-500">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
