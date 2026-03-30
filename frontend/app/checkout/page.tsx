'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/components/CartProvider';
import { useAuth } from '@/components/AuthProvider';
import { orders, api } from '@/lib/api';
import type { ShippingInfo } from '@/lib/api';

export default function CheckoutPage() {
  const { cart, refreshCart } = useCart();
  const { token } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ShippingInfo>({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_postal_code: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  useEffect(() => {
    if (token && cart?.items?.length === 0 && !orderId) router.push('/cart');
  }, [token, cart, orderId, router]);

  useEffect(() => {
    api<{ delivery_charge: string }>('/settings/', { token: false })
      .then((s) => setDeliveryCharge(Number(s.delivery_charge) || 0))
      .catch(() => setDeliveryCharge(0));
  }, []);

  const update = (k: keyof ShippingInfo, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handlePlaceOrder() {
    setSubmitting(true);
    try {
      const order = await orders.create(form);
      setOrderId(order.id);
      await refreshCart();
      setStep(3);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Order failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) return null;

  if (orderId && step === 3) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-cream-50 rounded-2xl p-12 border border-gold-100"
        >
          <div className="text-6xl mb-4">✓</div>
          <h1 className="font-serif text-3xl text-gold-700 mb-2">Thank you!</h1>
          <p className="text-charcoal-600 mb-6">
            Your order has been received. You will receive your order within 7–8 business days.
          </p>
          <p className="text-sm text-charcoal-500 mb-8">A confirmation email has been sent to your email address.</p>
          <Link href="/" className="inline-block px-8 py-3 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors">
            Continue shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) return null;

  const cartSubtotal = Number(cart.total) || 0;
  const grandTotal = cartSubtotal + deliveryCharge;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-serif text-3xl text-gold-700 mb-8">Checkout</h1>

      <div className="flex gap-4 mb-8">
        {[1, 2].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => s < step && setStep(s)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              step >= s ? 'bg-gold-500 text-white' : 'bg-cream-200 text-charcoal-600'
            }`}
          >
            {s === 1 ? 'Shipping' : 'Summary'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Full name *</label>
              <input type="text" value={form.shipping_name} onChange={(e) => update('shipping_name', e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-gold-200 focus:border-gold-500 outline-none" />
            </div>
            <div>
              <p className="text-sm text-charcoal-600">
                Order confirmation will be sent to your login email.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Phone *</label>
              <input type="tel" value={form.shipping_phone} onChange={(e) => update('shipping_phone', e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-gold-200 focus:border-gold-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Address *</label>
              <textarea value={form.shipping_address} onChange={(e) => update('shipping_address', e.target.value)} required rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gold-200 focus:border-gold-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">City *</label>
                <input type="text" value={form.shipping_city} onChange={(e) => update('shipping_city', e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-gold-200 focus:border-gold-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Postal code (optional)</label>
                <input
                  type="text"
                  value={form.shipping_postal_code}
                  onChange={(e) => update('shipping_postal_code', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gold-200 focus:border-gold-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gold-200 focus:border-gold-500 outline-none" placeholder="Delivery instructions..." />
            </div>
            <button type="button" onClick={() => setStep(2)} className="mt-6 w-full sm:w-auto px-8 py-3 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 transition-colors">
              Continue to summary
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="bg-cream-50 rounded-xl p-6 border border-gold-100 mb-6">
              <h3 className="font-serif text-lg text-charcoal-800 mb-4">Order summary</h3>
              <ul className="space-y-2 text-charcoal-600">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span className="text-gold-700 font-medium">{item.subtotal}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gold-200 space-y-2 text-charcoal-800">
                <p className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-gold-700 font-medium">{cart.total}</span>
                </p>
                <p className="flex justify-between text-sm text-charcoal-600">
                  <span>Delivery charges</span>
                  <span className="text-gold-700 font-medium">{deliveryCharge}</span>
                </p>
                <p className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-gold-700">{grandTotal}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button type="button" onClick={() => setStep(1)} className="px-6 py-3 border border-gold-300 text-gold-700 rounded-lg font-medium hover:bg-gold-50">
                Back
              </button>
              <button type="button" onClick={handlePlaceOrder} disabled={submitting} className="px-8 py-3 bg-gold-500 text-white rounded-lg font-medium hover:bg-gold-600 disabled:opacity-50">
                {submitting ? 'Placing order...' : 'Place order'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
