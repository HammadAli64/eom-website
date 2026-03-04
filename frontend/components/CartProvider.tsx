'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { cart as cartApi, CartResponse } from '@/lib/api';
import { useAuth } from './AuthProvider';

type CartContextType = {
  cart: CartResponse | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!token) { setCart(null); return; }
    setLoading(true);
    try {
      const data = await cartApi.get();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: number, quantity = 1) => {
    if (!token) return;
    const data = await cartApi.add(productId, quantity);
    setCart(data);
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!token) return;
    const data = await cartApi.update(itemId, quantity);
    setCart(data);
  };

  const removeItem = async (itemId: number) => {
    if (!token) return;
    const data = await cartApi.remove(itemId);
    setCart(data);
  };

  return (
    <CartContext.Provider value={{ cart, loading, refreshCart, addToCart, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
