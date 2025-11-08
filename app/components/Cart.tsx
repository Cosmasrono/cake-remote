'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatToKsh } from '@/app/lib/currency'; // Import the currency formatter

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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      const response = await fetch(`/api/cart?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCartItems(cartItems.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    router.push(`/payment?cartItems=${JSON.stringify(cartItems)}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-pink-600" />
              <h2 className="text-2xl font-bold">Shopping Cart</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.cakeName}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">{item.cakeName}</h3>
                      <p className="text-gray-600 text-sm">{item.cakeType}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-pink-600 font-bold text-lg">{formatToKsh(item.price)}</span>
                        <span className="text-gray-600">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 hover:bg-red-100 rounded-lg h-fit transition-colors duration-200"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4 bg-white">
              <div className="flex items-center justify-between text-xl font-bold">
                <span>Total:</span>
                <span className="text-pink-600 text-2xl">{formatToKsh(total)}</span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-pink-600 text-white py-4 rounded-lg font-semibold hover:bg-pink-700 transition-colors duration-200 transform hover:scale-105"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}