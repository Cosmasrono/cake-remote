'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatToKsh } from '@/app/lib/currency';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { div } from 'framer-motion/client';

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
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');

  useEffect(() => {
    const items = searchParams.get('cartItems');
    if (items) {
      setCartItems(JSON.parse(items));
    }
  }, [searchParams]);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const pollPaymentStatus = (checkoutId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for 60 seconds (30 attempts × 2 seconds)

    const interval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(`/api/check-payment?checkoutRequestId=${checkoutId}`);
        const data = await response.json();

        if (data.status === 'success') {
          clearInterval(interval);
          setPaymentStatus('success');
          setLoading(false);
          // Clear the cart after successful payment
          await clearCart();
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setPaymentStatus('failed');
          setError('Payment was cancelled or failed');
          setLoading(false);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPaymentStatus('failed');
          setError('Payment timeout. Please check your phone and try again.');
          setLoading(false);
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 2000); // Check every 2 seconds
  };

  const clearCart = async () => {
    try {
      // Delete all cart items
      for (const item of cartItems) {
        await fetch(`/api/cart?id=${item.id}`, { method: 'DELETE' });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handleMpesaCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPaymentStatus('processing');

    if (!phoneNumber) {
      setError('Please enter your Mpesa phone number.');
      setLoading(false);
      setPaymentStatus('idle');
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
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCheckoutRequestId(data.CheckoutRequestID);
        // Start polling for payment status
        pollPaymentStatus(data.CheckoutRequestID);
      } else {
        setPaymentStatus('failed');
        setError(data.error || 'Failed to initiate Mpesa STK Push.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error during Mpesa checkout:', err);
      setPaymentStatus('failed');
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setPaymentStatus('idle');
    setError(null);
    setCheckoutRequestId('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">Complete Your Purchase</h1>
        
        {/* Show payment form when idle */}
        {paymentStatus === 'idle' && (
          <>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            {cartItems.length === 0 ? (
              <p className="text-gray-600">Your cart is empty.</p>
            ) : (
              <>
                <div className="space-y-2 mb-4 bg-gray-50 p-4 rounded-lg">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <p className="text-gray-700">{item.cakeName} ({item.cakeType}) x {item.quantity}</p>
                      <p className="font-semibold">{formatToKsh(item.price * item.quantity)}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center font-bold text-lg border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span className="text-pink-600">{formatToKsh(totalAmount)}</span>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                <form onSubmit={handleMpesaCheckout} className="space-y-4">
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="e.g., 0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                  
                  {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || cartItems.length === 0}
                  >
                    Pay with M-Pesa
                  </button>
                </form>
              </>
            )}
          </>
        )}

        {/* Show processing state */}
        {paymentStatus === 'processing' && (
          <div className="text-center py-8">
            <Loader className="w-16 h-16 text-pink-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment...</h3>
            <p className="text-gray-600 mb-2">Please check your phone for the M-Pesa prompt</p>
            <p className="text-sm text-gray-500">Enter your M-Pesa PIN to complete the transaction</p>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                💡 Make sure to check your phone and enter your PIN within 60 seconds
              </p>
            </div>
          </div>
        )}

        {/* Show success state */}
        {paymentStatus === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-2">Your order has been confirmed</p>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-green-800">
                Total Paid: <span className="font-bold">{formatToKsh(totalAmount)}</span>
              </p>
            </div>
            <div className="space-y-3">
              
                href="/"
                className="block w-full bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition text-center font-semibold"
              >
                Back to Home
              </a>
              
                href="/orders"
                className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition text-center font-semibold"
              >
                View My Orders
              </a>
            </div>
          </div>
        )}

        {/* Show failure state */}
        {paymentStatus === 'failed' && (
          <div className="text-center py-8">
            <XCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-4">{error || 'Something went wrong with your payment'}</p>
            <div className="bg-red-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-red-800">
                Please try again or contact support if the issue persists
              </p>
            </div>
            <button
              onClick={handleTryAgain}
              className="w-full bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition font-semibold"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function handleTryAgain() {
  window.location.reload();
}
