'use client';

import React from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { Star, ChefHat } from 'lucide-react';
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

  if (error) return <div className="text-center py-12 text-red-600">Failed to load cakes</div>;
  if (isLoading) return <div className="text-center py-12">Loading cakes...</div>;

  return (
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
          <button className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition">
            Contact Us for Custom Orders
          </button>
        </div>
      </div>
    </div>
  );
}