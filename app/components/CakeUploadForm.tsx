
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const cakeNames = [
  'Vanilla Dream',
  'Chocolate Fudge',
  'Red Velvet Classic',
  'Lemon Zest',
  'Strawberry Delight',
  'Carrot Craze',
  'Coffee Mocha',
  'Black Forest',
  'White Chocolate Raspberry',
];

const cakeTypes = [
  'Layer Cake',
  'Cupcake',
  'Cheesecake',
  'Bundt Cake',
  'Sheet Cake',
  'Muffin',
  'Brownie',
  'Cookie Cake',
];

export default function CakeUploadForm() {
  const [cakeName, setCakeName] = useState('');
  const router = useRouter();
  const [cakeType, setCakeType] = useState('');
  const [cakePrice, setCakePrice] = useState('');
  const [cakeImage, setCakeImage] = useState<File | null>(null);
  const [cakeUploadStatus, setCakeUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [cakeUploadMessage, setCakeUploadMessage] = useState('');

  const handleCakeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCakeImage(e.target.files[0]);
    }
  };

  const handleCakeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cakeName || !cakeType || !cakePrice || !cakeImage) {
      setCakeUploadStatus('error');
      setCakeUploadMessage('Please fill in all cake fields and select an image.');
      return;
    }

    setCakeUploadStatus('uploading');
    setCakeUploadMessage('');

    const formData = new FormData();
    formData.append('name', cakeName);
    formData.append('type', cakeType);
    formData.append('price', cakePrice);
    formData.append('image', cakeImage);

    try {
      const response = await fetch('/api/admin/cakes/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setCakeUploadStatus('success');
        setCakeUploadMessage('Cake uploaded successfully!');
        setCakeName('');
        setCakeType('');
        setCakePrice('');
        setCakeImage(null);
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 2000); // Redirect after 2 seconds
      } else {
        const errorData = await response.json();
        setCakeUploadStatus('error');
        setCakeUploadMessage(errorData.error || 'Failed to upload cake.');
      }
    } catch (error) {
      console.error('Cake upload error:', error);
      setCakeUploadStatus('error');
      setCakeUploadMessage('An error occurred during cake upload.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Upload New Cake</h2>
      <form onSubmit={handleCakeUpload} className="space-y-6">
        <div>
          <label htmlFor="cake-name" className="block text-sm font-medium text-gray-700">Cake Name</label>
          <select
            id="cake-name"
            value={cakeName}
            onChange={(e) => setCakeName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="" disabled>Select a cake name</option>
            {cakeNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cake-type" className="block text-sm font-medium text-gray-700">Cake Type</label>
          <select
            id="cake-type"
            value={cakeType}
            onChange={(e) => setCakeType(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="" disabled>Select a cake type</option>
            {cakeTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cake-price" className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            id="cake-price"
            value={cakePrice}
            onChange={(e) => setCakePrice(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="cake-image" className="block text-sm font-medium text-gray-700">Cake Image</label>
          <input
            type="file"
            id="cake-image"
            accept="image/*"
            onChange={handleCakeImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          disabled={cakeUploadStatus === 'uploading'}
        >
          {cakeUploadStatus === 'uploading' ? 'Uploading...' : 'Upload Cake'}
        </button>
        {cakeUploadStatus !== 'idle' && cakeUploadMessage && (
          <p className={`text-center text-sm ${cakeUploadStatus === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {cakeUploadMessage}
          </p>
        )}
      </form>
    </div>
  );
}
