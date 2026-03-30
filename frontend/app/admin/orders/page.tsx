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
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    admin
      .orders(
        fromDate || toDate
          ? { status: filter, start: fromDate ? `${fromDate}T00:00:00` : undefined, end: toDate ? `${toDate}T23:59:59` : undefined }
          : { status: filter, year, month }
      )
      .then(setData)
      .catch(() => setData({ orders: [], stats: { all: 0, pending: 0, sent: 0, complete: 0, return: 0 } }))
      .finally(() => setLoading(false));
  }, [filter, year, month, fromDate, toDate]);

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
  const revenue = data?.revenue;

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
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gold-200 bg-white text-sm"
            />
            <span className="text-sm text-charcoal-500">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gold-200 bg-white text-sm"
            />
            <button
              type="button"
              onClick={() => { setFromDate(''); setToDate(''); }}
              className="px-3 py-2 rounded-lg border border-gold-200 text-sm hover:bg-gold-50"
            >
              Clear range
            </button>
          </div>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            className="px-3 py-2 rounded-lg border border-gold-200 bg-white text-sm"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i, 1).toLocaleString(undefined, { month: 'long' })}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10) || now.getFullYear())}
            className="w-28 px-3 py-2 rounded-lg border border-gold-200 bg-white text-sm"
            min={2020}
            max={2100}
          />
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

      {revenue ? (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-gold-100 shadow-luxury p-4">
            <p className="text-xs text-charcoal-500">Completed revenue (delivered)</p>
            <p className="text-2xl font-semibold text-charcoal-800 mt-1">{revenue.complete.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gold-100 shadow-luxury p-4">
            <p className="text-xs text-charcoal-500">Revenue (all non-cancelled)</p>
            <p className="text-2xl font-semibold text-charcoal-800 mt-1">{revenue.all_non_cancelled.toFixed(2)}</p>
          </div>
        </div>
      ) : null}

      {data?.series?.length ? (
        <div className="mb-6 bg-white rounded-xl border border-gold-100 shadow-luxury p-4">
          <h2 className="font-serif text-lg text-charcoal-800 mb-3">Orders by day</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-charcoal-600">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">All</th>
                  <th className="py-2 pr-3">Pending</th>
                  <th className="py-2 pr-3">Sent</th>
                  <th className="py-2 pr-3">Complete</th>
                  <th className="py-2 pr-3">Return</th>
                </tr>
              </thead>
              <tbody>
                {data.series.map((r) => (
                  <tr key={r.label} className="border-t border-gold-100">
                    <td className="py-2 pr-3 text-charcoal-600">{r.label}</td>
                    <td className="py-2 pr-3 font-medium">{r.all}</td>
                    <td className="py-2 pr-3">{r.pending}</td>
                    <td className="py-2 pr-3">{r.sent}</td>
                    <td className="py-2 pr-3">{r.complete}</td>
                    <td className="py-2 pr-3">{r.return}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

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
