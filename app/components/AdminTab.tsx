'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminTabProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export default function AdminTab({ showToast }: AdminTabProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [rating, setRating] = useState('5'); // Default rating to 5
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/cakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, type, price: parseFloat(price), image, rating: parseInt(rating) }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`Cake '${name}' created successfully!`, 'success');
        setName('');
        setType('');
        setPrice('');
        setImage('');
        setRating('5');
        router.refresh(); // Refresh the page to show new cake
      } else {
        showToast(data.error || 'Failed to create cake. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error creating cake:', error);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create New Cake</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Cake Name</label>
          <input
            type="text"
            id="name"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-pink-500 focus:border-pink-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Cake Type</label>
          <input
            type="text"
            id="type"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-pink-500 focus:border-pink-500"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            id="price"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-pink-500 focus:border-pink-500"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="url"
            id="image"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-pink-500 focus:border-pink-500"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
          <input
            type="number"
            id="rating"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-pink-500 focus:border-pink-500"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
            min="1"
            max="5"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-pink-600 text-white p-3 rounded-md font-semibold hover:bg-pink-700 transition duration-300 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Cake'}
        </button>
      </form>
    </div>
  );
}
