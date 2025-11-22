'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, Minus, Plus, Trash2, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatToKsh } from '@/app/lib/currency';

interface CartItem {
  id: string;
  cakeName: string;
  cakeType: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) fetchCart();
  }, [isOpen]);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cart');
      if (res.ok) setCartItems(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: string, delta: number) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) return removeFromCart(id);

    try {
      await fetch(`/api/cart?id=${id}&quantity=${newQty}`, { method: 'PATCH' });
      setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    } catch { /* optimistic UI already applied */ }
  };

  const removeFromCart = async (id: string) => {
    try {
      await fetch(`/api/cart?id=${id}`, { method: 'DELETE' });
    } catch {}
    setCartItems(prev => prev.filter(i => i.id !== id));
  };

  const total = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Cart Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-br from-pink-50 to-rose-50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-9 h-9 text-pink-600" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
              <p className="text-sm text-gray-600">{itemCount} items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/70 rounded-full transition"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-28 h-28 bg-gray-200 rounded-2xl" />
                  <div className="flex-1 space-y-3 py-4">
                    <div className="h-5 bg-gray-200 rounded w-4/5" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-10 bg-gray-200 rounded-full w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-8 text-center">
              <div className="bg-pink-100 rounded-full p-10 mb-6">
                <ShoppingCart className="w-20 h-20 text-pink-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Cart is empty</h3>
              <p className="text-gray-500">Add some delicious cakes to get started!</p>
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="flex gap-4 p-5">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-dashed border-pink-100">
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt={item.cakeName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                        {item.cakeName}
                      </h3>
                      <p className="text-pink-600 font-medium text-sm mt-1">{item.cakeType}</p>

                      <div className="flex items-center justify-between mt-4">
                        <span className="text-2xl font-bold text-pink-600">
                          {formatToKsh(item.price)}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center bg-gray-100 rounded-full">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-2 hover:bg-gray-200 rounded-full transition"
                          >
                            {item.quantity === 1 ? (
                              <Trash2 className="w-4 h-4 text-red-500" />
                            ) : (
                              <Minus className="w-4 h-4" />
                            )}
                          </button>
                          <span className="w-12 text-center font-bold text-lg">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-2 hover:bg-gray-200 rounded-full transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-bold text-gray-900">
                          {formatToKsh(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="w-full py-3 bg-red-50 text-red-600 font-medium hover:bg-red-100 transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Footer */}
        {cartItems.length > 0 && (
          <div className="border-t-2 border-gray-200 bg-white p-6 space-y-5">
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold">{formatToKsh(total)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold pt-4 border-t">
                <span>Total</span>
                <span className="text-pink-600">{formatToKsh(total)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push(`/payment?cart=${encodeURIComponent(JSON.stringify(cartItems))}`)}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-lg py-4 rounded-2xl hover:from-pink-700 hover:to-rose-700 transition transform hover:scale-[1.02] active:scale-100 shadow-lg flex items-center justify-center gap-3"
            >
              <Package className="w-6 h-6" />
              Proceed to Checkout
            </button>

            <p className="text-center text-xs text-gray-500">
              Free delivery on orders above KSh 5,000 • Secure payment
            </p>
          </div>
        )}
      </div>
    </>
  );
}