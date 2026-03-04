'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { admin } from '@/lib/api';
import type { Category } from '@/lib/api';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createSlug, setCreateSlug] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function load() {
    admin.categories().then(setCategories).catch(() => []).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim()) return;
    setSubmitting(true);
    try {
      await admin.categoryCreate({
        name: createName.trim(),
        slug: createSlug.trim() || createName.trim().toLowerCase().replace(/\s+/g, '-'),
        description: createDesc.trim(),
      });
      setCreateName('');
      setCreateSlug('');
      setCreateDesc('');
      setShowForm(false);
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(id: number) {
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      await admin.categoryUpdate(id, { name: newName.trim(), slug: newSlug.trim() || newName.trim().toLowerCase().replace(/\s+/g, '-') });
      setEditing(null);
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await admin.categoryDelete(id);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  if (loading) return <div className="h-64 bg-cream-200 rounded-xl animate-pulse" />;

  return (
    <div>
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-serif text-2xl text-charcoal-800 mb-8">
        Categories
      </motion.h1>
      <div className="mb-6">
        {!showForm ? (
          <button type="button" onClick={() => setShowForm(true)} className="px-4 py-2 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600">
            Add category
          </button>
        ) : (
          <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end p-4 bg-cream-50 rounded-xl border border-gold-100">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Name</label>
              <input type="text" value={createName} onChange={(e) => setCreateName(e.target.value)} required className="px-3 py-2 rounded-lg border border-gold-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Slug</label>
              <input type="text" value={createSlug} onChange={(e) => setCreateSlug(e.target.value)} placeholder="auto" className="px-3 py-2 rounded-lg border border-gold-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Description</label>
              <input type="text" value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} className="px-3 py-2 rounded-lg border border-gold-200" />
            </div>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-gold-500 text-white rounded-lg">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gold-300 rounded-lg">Cancel</button>
          </form>
        )}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-gold-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream-50">
              <th className="p-3 text-left font-medium text-charcoal-700">Name</th>
              <th className="p-3 text-left font-medium text-charcoal-700">Slug</th>
              <th className="p-3 text-left font-medium text-charcoal-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-gold-100">
                <td className="p-3">
                  {editing === c.id ? (
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="px-2 py-1 border rounded w-full max-w-xs" />
                  ) : (
                    c.name
                  )}
                </td>
                <td className="p-3">
                  {editing === c.id ? (
                    <input type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} className="px-2 py-1 border rounded w-full max-w-xs" />
                  ) : (
                    c.slug
                  )}
                </td>
                <td className="p-3 flex gap-2">
                  {editing === c.id ? (
                    <>
                      <button type="button" onClick={() => handleUpdate(c.id)} disabled={submitting} className="text-gold-600 hover:underline">Save</button>
                      <button type="button" onClick={() => { setEditing(null); }} className="text-charcoal-500 hover:underline">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => { setEditing(c.id); setNewName(c.name); setNewSlug(c.slug); }} className="text-gold-600 hover:underline">Edit</button>
                      <button type="button" onClick={() => handleDelete(c.id, c.name)} className="text-red-600 hover:underline">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
