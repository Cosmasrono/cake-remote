'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { Star, ChefHat, X, Upload } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { formatToKsh } from '@/app/lib/currency';

interface Cake {
  id: string;
  name: string;
  type: string;
  rating: number;
  price: number;
  image: string;
}

interface CakesTabProps {
  handleAddToCart: (cakeName: string, cakeType: string, price: number, image: string) => void;
  isSubmitting: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CakesTab({ handleAddToCart, isSubmitting }: CakesTabProps) {
  const { data: cakes, error, isLoading } = useSWR<Cake[]>('/api/cakes', fetcher);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setFormStatus('idle');
    setErrorMessage('');
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCustomOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to submit order');

      setFormStatus('success');
      setTimeout(() => {
        closeModal();
        e.currentTarget.reset();
      }, 2000);
    } catch (err: any) {
      setFormStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  if (error) return <div className="text-center py-12 text-red-600">Failed to load cakes</div>;
  if (isLoading) return <div className="text-center py-12">Loading cakes...</div>;

  return (
    <>
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Signature Cakes</h2>
            <p className="text-xl text-gray-600">Handcrafted with love, baked to perfection</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {cakes?.map((cake) => (
              <div key={cake.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="h-48 overflow-hidden relative">
                  <Image
                    src={cake.image}
                    alt={cake.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover hover:scale-110 transition-transform duration-300"
                    priority
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{cake.name}</h3>
                  <p className="text-gray-600 mb-2">{cake.type}</p>
                  <p className="text-2xl font-bold text-pink-600 mb-3">{formatToKsh(cake.price)}</p>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(cake.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <button
                    onClick={() => handleAddToCart(cake.name, cake.type, cake.price, cake.image)}
                    disabled={isSubmitting}
                    className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Orders Section */}
          <div className="mt-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-12 text-white text-center">
            <ChefHat className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-4">Custom Cake Orders</h3>
            <p className="text-xl mb-6 max-w-2xl mx-auto">
              Have a special occasion? We create custom cakes tailored to your vision and taste
            </p>
            <button
              onClick={openModal}
              className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition"
            >
              Contact Us for Custom Orders
            </button>
          </div>
        </div>
      </div>

      {/* Custom Order Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div className="flex items-center gap-3">
                <ChefHat className="w-10 h-10 text-pink-600" />
                <Dialog.Title className="text-2xl font-bold">Custom Cake Order</Dialog.Title>
              </div>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCustomOrder} className="p-6 space-y-6">
              {formStatus === 'success' && (
                <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center font-semibold">
                  Thank you! Your custom order has been received. We'll contact you soon!
                </div>
              )}

              {formStatus === 'error' && (
                <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center">
                  {errorMessage}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name *</label>
                  <input name="name" type="text" required className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <input name="phone" type="tel" required className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="+254 712 345 678" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Occasion</label>
                  <input name="occasion" type="text" className="w-full px-4 py-3 border rounded-lg" placeholder="Birthday, Wedding..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Date</label>
                  <input name="date" type="date" className="w-full px-4 py-3 border rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Flavor</label>
                  <input name="flavor" type="text" className="w-full px-4 py-3 border rounded-lg" placeholder="Chocolate, Vanilla, Red Velvet..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Size / Tiers</label>
                  <input name="size" type="text" className="w-full px-4 py-3 border rounded-lg" placeholder="8-inch, 3 tiers, serves 30..." />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message on Cake</label>
                <input name="message" type="text" className="w-full px-4 py-3 border rounded-lg" placeholder="Happy 30th Birthday John!" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Inspiration Link (Pinterest, Instagram, etc.)</label>
                <input name="inspirationLink" type="url" className="w-full px-4 py-3 border rounded-lg" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload Inspiration Image</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg cursor-pointer hover:bg-pink-700 transition">
                    <Upload className="w-5 h-5" />
                    Choose File
                    <input name="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-lg border" />}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={closeModal} className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-70 transition"
                >
                  {formStatus === 'submitting' ? 'Submitting...' : 'Submit Order'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}