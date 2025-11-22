'use client';

import React from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { Star, Flame } from 'lucide-react';
import { formatToKsh } from '@/app/lib/currency';

interface Pizza {
  id: string;
  name: string;
  description: string;
  rating: number;
  price: number;
  image: string;
  size?: 'Small' | 'Medium' | 'Large';
  isVeg?: boolean;
  spicyLevel?: number;
}

interface PizzaTabProps {
  handleAddToCart: (name: string, description: string, price: number, image: string) => void;
  isSubmitting: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PizzaTab({ handleAddToCart, isSubmitting }: PizzaTabProps) {
  const { data: pizzas, error, isLoading } = useSWR<Pizza[]>('/api/pizzas', fetcher);

  if (error) return <div className="text-center text-red-500 py-12">Failed to load pizzas</div>;
  if (isLoading) return <div className="text-center py-12 text-gray-600">Loading delicious pizzas...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-gray-800 mb-4">Artisan Pizzas</h2>
        <p className="text-xl text-gray-600">Hand-tossed dough, fresh toppings, baked to perfection</p>
      </div>

      {/* Pizza Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pizzas?.map((pizza) => (
          <div
            key={pizza.id}
            className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-3"
          >
            {/* Image */}
            <div className="relative h-80">
              <Image
                src={pizza.image}
                alt={pizza.name}
                fill
                className="object-cover"
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {pizza.isVeg && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    Vegetarian
                  </span>
                )}
                {pizza.size && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {pizza.size}
                  </span>
                )}
              </div>
              {pizza.spicyLevel && pizza.spicyLevel > 0 && (
                <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-1">
                  {[...Array(pizza.spicyLevel)].map((_, i) => (
                    <Flame key={i} className="w-5 h-5" />
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{pizza.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{pizza.description}</p>

              <div className="flex items-center justify-between mb-5">
                <p className="text-3xl font-bold text-pink-600">
                  {formatToKsh(pizza.price)}
                </p>
                <div className="flex gap-1">
                  {[...Array(pizza.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  handleAddToCart(pizza.name, pizza.description, pizza.price, pizza.image)
                }
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="mt-16 bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl p-10 text-center">
        <h3 className="text-4xl font-bold text-gray-800 mb-6">
          Made Fresh Daily
        </h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div>
            <div className="text-5xl mb-3">Hand-Tossed Dough</div>
            <p className="text-gray-600">48-hour fermented for perfect texture</p>
          </div>
          <div>
            <div className="text-5xl mb-3">Premium Cheese</div>
            <p className="text-gray-600">100% real mozzarella, never processed</p>
          </div>
          <div>
            <div className="text-5xl mb-3">Wood-Fired Oven</div>
            <p className="text-gray-600">Baked at 400°C for authentic taste</p>
          </div>
        </div>
      </div>
    </div>
  );
}