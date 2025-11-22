// components/CustomOrderModal.tsx
'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Upload, ChefHat } from 'lucide-react';

interface CustomOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomOrderModal({ isOpen, onClose }: CustomOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/custom-orders', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        e.currentTarget.reset();
        setImagePreview(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
          <div className="flex justify-between items-center p-6 border-b">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-pink-600" />
              <Dialog.Title className="text-2xl font-bold">Custom Cake Order</Dialog.Title>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {success && (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center font-semibold">
                Order submitted successfully! We'll contact you soon.
              </div>
            )}

            {error && (
              <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name *</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number *</label>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="+254 712 345 678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Occasion</label>
                <input
                  name="occasion"
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Birthday, Wedding, Anniversary..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preferred Date</label>
                <input
                  name="date"
                  type="date"
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Flavor</label>
                <input
                  name="flavor"
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Vanilla, Chocolate, Red Velvet..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Size / Tiers</label>
                <input
                  name="size"
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="6-inch, 3 tiers, serves 20..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message on Cake</label>
              <input
                name="message"
                type="text"
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="Happy Birthday Mary!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Inspiration Link (Pinterest, etc.)</label>
              <input
                name="inspirationLink"
                type="url"
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="https://pinterest.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Upload Inspiration Image</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg cursor-pointer hover:bg-pink-700 transition">
                  <Upload className="w-5 h-5" />
                  Choose Image
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-pink-400 transition"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Order'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}