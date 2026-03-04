'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { admin } from '@/lib/api';
import type { User } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admin.users().then(setUsers).catch(() => []).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 bg-cream-200 rounded-xl animate-pulse" />;

  return (
    <div>
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-2xl text-charcoal-800 mb-8">
        Users
      </motion.h1>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-gold-100 shadow-luxury overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream-50">
                <th className="p-3 font-medium text-charcoal-700 text-left">ID</th>
                <th className="p-3 font-medium text-charcoal-700 text-left">Email</th>
                <th className="p-3 font-medium text-charcoal-700 text-left">Username</th>
                <th className="p-3 font-medium text-charcoal-700 text-left">Name</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-charcoal-500">No users.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-t border-gold-100 hover:bg-cream-50/50">
                    <td className="p-3">{u.id}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.username}</td>
                    <td className="p-3">{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</td>
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
