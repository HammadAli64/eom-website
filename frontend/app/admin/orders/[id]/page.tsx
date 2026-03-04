'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { admin } from '@/lib/api';
import type { Order, OrderStatusValue } from '@/lib/api';

const STATUS_OPTIONS: { value: OrderStatusValue; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Sent' },
  { value: 'delivered', label: 'Complete' },
  { value: 'cancelled', label: 'Return' },
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState('');

  function loadOrder() {
    if (!id || isNaN(id)) return;
    admin.order(id).then(setOrder).catch(() => setOrder(null)).finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as OrderStatusValue;
    if (!order || !id) return;
    setStatusError('');
    setSavingStatus(true);
    try {
      const updated = await admin.orderUpdateStatus(id, newStatus);
      setOrder(updated);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  }

  if (loading) return <div className="h-64 bg-cream-200 rounded-xl animate-pulse" />;
  if (!order) return <p className="text-red-600">Order not found.</p>;

  return (
    <div>
      <Link href="/admin/orders" className="text-gold-600 hover:underline text-sm mb-4 inline-block">← Back to orders</Link>
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-2xl text-charcoal-800 mb-6">
        Order {order.order_number}
      </motion.h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gold-100 p-6">
          <h3 className="font-medium text-charcoal-800 mb-4">Shipping</h3>
          <p>{order.shipping_name}</p>
          <p className="text-charcoal-600">{order.shipping_email}</p>
          <p className="text-charcoal-600">{order.shipping_phone}</p>
          <p className="mt-2">{order.shipping_address}, {order.shipping_city} {order.shipping_postal_code}</p>
          {order.notes && <p className="mt-2 text-sm text-charcoal-500">Notes: {order.notes}</p>}
        </div>
        <div className="bg-white rounded-xl border border-gold-100 p-6">
          <label className="block text-sm font-medium text-charcoal-700 mb-2">Status</label>
          <select
            value={order.status}
            onChange={handleStatusChange}
            disabled={savingStatus}
            className="w-full max-w-xs px-3 py-2 rounded-lg border border-gold-200 focus:border-gold-500 outline-none bg-white disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {savingStatus && <p className="mt-1 text-xs text-charcoal-500">Saving...</p>}
          {statusError && <p className="mt-1 text-sm text-red-600">{statusError}</p>}
          <p className="text-sm text-charcoal-500 mt-4">Total</p>
          <p className="text-xl font-semibold text-gold-700">{order.total}</p>
        </div>
      </div>
      <div className="mt-6 bg-white rounded-xl border border-gold-100 overflow-hidden">
        <h3 className="p-4 border-b border-gold-100 font-medium text-charcoal-800">Items</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream-50">
              <th className="p-3 text-left font-medium text-charcoal-700">Product</th>
              <th className="p-3 text-left font-medium text-charcoal-700">Qty</th>
              <th className="p-3 text-left font-medium text-charcoal-700">Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item) => (
              <tr key={item.id} className="border-t border-gold-100">
                <td className="p-3">{item.product_name}</td>
                <td className="p-3">{item.quantity}</td>
                <td className="p-3">{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
