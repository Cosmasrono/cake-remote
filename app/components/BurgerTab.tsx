'use client';
import React from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { Star, Beef } from 'lucide-react';
import { formatToKsh } from '@/app/lib/currency';

interface Burger {
  id: string;
  name: string;
  description: string;
  rating: number;
  price: number;
  image: string;
  isDouble?: boolean;
  isCheese?: boolean;
}

interface BurgerTabProps {
  handleAddToCart: (name: string, description: string, price: number, image: string) => void;
  isSubmitting: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BurgerTab({ handleAddToCart, isSubmitting }: BurgerTabProps) {
  const { data: burgers, error, isLoading } = useSWR('/api/burgers', fetcher);

  if (error) return <div className="text-center text-red-500 py-12">Failed to load burgers</div>;
  if (isLoading) return <div className="text-center py-12">Loading burgers...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold text-gray-800 mb-4">Gourmet Burgers</h2>
        <p className="text-xl text-gray-600">
          Juicy patties, fresh toppings, unforgettable taste
        </p>
      </div>

      {/* Burger Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {burgers?.map((burger: Burger) => (
          <div
            key={burger.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
          >
            <div className="relative h-72">
              <Image
                src={burger.image}
                alt={burger.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                {burger.isDouble && (
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Beef className="w-4 h-4" />
                    Double
                  </span>
                )}
                {burger.isCheese && (
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    🧀 Cheese
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {burger.name}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {burger.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <p className="text-3xl font-bold text-pink-600">
                  {formatToKsh(burger.price)}
                </p>
                <div className="flex gap-1">
                  {[...Array(burger.rating)].map((_, i) => (
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
                    burger.name,
                    burger.description,
                    burger.price,
                    burger.image
                  )
                }
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customization Section */}
      <div className="mt-16 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Build Your Perfect Burger
        </h3>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl mb-2">🍔</div>
            <h4 className="font-semibold text-lg mb-2">Choice of Patty</h4>
            <p className="text-gray-600 text-sm">
              Beef, chicken, or veggie options
            </p>
          </div>
          <div>
            <div className="text-4xl mb-2">🧀</div>
            <h4 className="font-semibold text-lg mb-2">Premium Cheese</h4>
            <p className="text-gray-600 text-sm">
              Cheddar, Swiss, or blue cheese
            </p>
          </div>
          <div>
            <div className="text-4xl mb-2">🥬</div>
            <h4 className="font-semibold text-lg mb-2">Fresh Toppings</h4>
            <p className="text-gray-600 text-sm">
              Lettuce, tomato, onions & more
            </p>
          </div>
          <div>
            <div className="text-4xl mb-2">🍟</div>
            <h4 className="font-semibold text-lg mb-2">Add Fries</h4>
            <p className="text-gray-600 text-sm">
              Crispy golden fries on the side
            </p>
          </div>
        </div>
        <div className="text-center mt-8">
          <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
            Request Custom Burger
          </button>
        </div>
      </div>

      {/* Combo Deals */}
      <div className="mt-12 bg-yellow-100 border-2 border-yellow-400 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">
          🎉 Special Combo Deals 🎉
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="bg-white p-4 rounded-lg">
            <p className="font-bold text-lg">Burger + Fries</p>
            <p className="text-pink-600 font-bold text-xl">Save KSh 100</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="font-bold text-lg">Burger + Drink</p>
            <p className="text-pink-600 font-bold text-xl">Save KSh 50</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="font-bold text-lg">Full Meal Deal</p>
            <p className="text-pink-600 font-bold text-xl">Save KSh 200</p>
          </div>
        </div>
      </div>
    </div>
  );
}