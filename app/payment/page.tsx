
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface CartItem {
  id: string;
  cakeName: string;
  cakeType: string;
  price: number;
  image: string;
  quantity: number;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const items = searchParams.get('cartItems');
    if (items) {
      setCartItems(JSON.parse(items));
    }
  }, [searchParams]);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleMpesaCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!phoneNumber) {
      setError('Please enter your Mpesa phone number.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/mpesa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          amount: totalAmount,
          // Add other necessary details like transaction description, etc.
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Mpesa STK Push initiated successfully!');
        // Optionally, clear the cart or navigate to a confirmation page
      } else {
        setError(data.error || 'Failed to initiate Mpesa STK Push.');
      }
    } catch (err) {
      console.error('Error during Mpesa checkout:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">Complete Your Purchase</h1>
        
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {cartItems.length === 0 ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="space-y-2 mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <p className="text-gray-700">{item.cakeName} ({item.cakeType}) x {item.quantity}</p>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="flex justify-between items-center font-bold text-lg border-t pt-2 mt-2">
              <span>Total:</span>
              <span className="text-pink-600">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
        <form onSubmit={handleMpesaCheckout} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Mpesa Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              placeholder="e.g., 254712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-3 rounded-md font-semibold hover:bg-pink-700 transition disabled:opacity-50"
            disabled={loading || cartItems.length === 0}
          >
            {loading ? 'Processing...' : 'Pay with Mpesa'}
          </button>
        </form>
      </div>
    </div>
  );
}
