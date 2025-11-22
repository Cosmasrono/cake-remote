'use client';
import React from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { Star, Flame } from 'lucide-react';
import { formatToKsh } from '@/app/lib/currency';

interface Shawarma {
  id: string;
  name: string;
  description: string;
  rating: number;
  price: number;
  image: string;
  spicyLevel?: number;
}

interface ShawarmaTabProps {
  handleAddToCart: (name: string, description: string, price: number, image: string) => void;
  isSubmitting: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ShawarmaTab({ handleAddToCart, isSubmitting }: ShawarmaTabProps) {
  const { data: shawarmas, error, isLoading } = useSWR('/api/shawarmas', fetcher);

  if (error) return <div className="text-center text-red-500 py-12">Failed to load shawarmas</div>;
  if (isLoading) return <div className="text-center py-12">Loading shawarmas...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-gray-800 mb-4">Authentic Shawarmas</h2>
        <p className="text-xl text-gray-600">
          Marinated to perfection, wrapped with love
        </p>
      </div>

      {/* Shawarma Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {shawarmas?.map((shawarma: Shawarma) => (
          <div
            key={shawarma.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
          >
            <div className="relative h-72">
              <Image
                src={shawarma.image}
                alt={shawarma.name}
                fill
                className="object-cover"
              />
              {shawarma.spicyLevel && shawarma.spicyLevel > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                  {[...Array(shawarma.spicyLevel)].map((_, i) => (
                    <Flame key={i} className="w-4 h-4" />
                  ))}
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {shawarma.name}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {shawarma.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <p className="text-3xl font-bold text-pink-600">
                  {formatToKsh(shawarma.price)}
                </p>
                <div className="flex gap-1">
                  {[...Array(shawarma.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  handleAddToCart(
                    shawarma.name,
                    shawarma.description,
                    shawarma.price,
                    shawarma.image
                  )
                }
                disabled={isSubmitting}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-16 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Why Choose Our Shawarmas?
        </h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl mb-2">🥙</div>
            <h4 className="font-semibold text-lg mb-2">Fresh Ingredients</h4>
            <p className="text-gray-600">
              Made daily with the freshest meats and vegetables
            </p>
          </div>
          <div>
            <div className="text-4xl mb-2">🌶️</div>
            <h4 className="font-semibold text-lg mb-2">Authentic Spices</h4>
            <p className="text-gray-600">
              Traditional Middle Eastern flavors and marinades
            </p>
          </div>
          <div>
            <div className="text-4xl mb-2">⚡</div>
            <h4 className="font-semibold text-lg mb-2">Quick Service</h4>
            <p className="text-gray-600">
              Hot and ready in minutes for your convenience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}