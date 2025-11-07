
'use client';

import { useRouter } from 'next/navigation';
import CakeUploadForm from '@/app/components/CakeUploadForm'; // Adjust path as needed
import { FaArrowLeft } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import NotificationToast from '@/app/components/NotificationToast'; // Import the new component
import ConfirmationModal from '@/app/components/ConfirmationModal'; // Import the new component

interface Cake {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string;
  rating: number;
}

export default function AdminCakesPage() {
  const router = useRouter();
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [cakeToDeleteId, setCakeToDeleteId] = useState<string | null>(null);

  const fetchCakes = async () => {
    try {
      const response = await fetch('/api/cakes');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Cake[] = await response.json();
      setCakes(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCakes();
  }, []);

  const handleDeleteCake = async (cakeId: string) => {
    setCakeToDeleteId(cakeId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (cakeToDeleteId) {
      try {
        const response = await fetch(`/api/admin/cakes/${cakeToDeleteId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setNotification({ message: 'Cake deleted successfully!', type: 'success' });
          fetchCakes(); // Refresh the list
        } else {
          const errorData = await response.json();
          setNotification({ message: errorData.error || 'Failed to delete cake.', type: 'error' });
        }
      } catch (error) {
        console.error('Error deleting cake:', error);
        setNotification({ message: 'An error occurred while deleting the cake.', type: 'error' });
      } finally {
        setIsConfirmModalOpen(false);
        setCakeToDeleteId(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setCakeToDeleteId(null);
  };

  if (loading) return <div className="text-center py-8">Loading cakes...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>;

  const handleOpenUpdateModal = (cake: Cake) => {
    setSelectedCake(cake);
    setIsUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedCake(null);
    fetchCakes(); // Refresh list after closing modal
  };

  const handleUpdateCake = (cakeId: string) => {
    console.log('Update cake with ID:', cakeId);
    // In a real application, you would open a modal or navigate to an edit page here
    // For now, let's find the cake and open the modal with its data
    const cakeToUpdate = cakes.find(cake => cake.id === cakeId);
    if (cakeToUpdate) {
      handleOpenUpdateModal(cakeToUpdate);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Cake Management</h1>
          <p className="text-gray-600">Upload new cakes and manage existing products</p>
        </div>

        {/* Upload Form */}
        <CakeUploadForm />

        {/* Existing Cakes List (You can add this later) */}
        <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Existing Cakes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Image</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-left">Price (Ksh)</th>
                  <th className="py-3 px-4 text-left">Rating</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cakes.map((cake) => (
                  <tr key={cake.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <img src={cake.image} alt={cake.name} className="w-16 h-16 object-cover rounded-md" />
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">{cake.name}</td>
                    <td className="py-3 px-4 text-gray-700">{cake.type}</td>
                    <td className="py-3 px-4 text-gray-700">{cake.price}</td>
                    <td className="py-3 px-4 text-gray-700">{cake.rating} / 5</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteCake(cake.id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleUpdateCake(cake.id)}
                        className="text-blue-600 hover:text-blue-900 font-medium ml-4"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {cakes.length === 0 && (
            <p className="text-gray-500 mt-4">No cakes available. Upload a new cake to get started!</p>
          )}
        </div>
      </div>

      {isUpdateModalOpen && selectedCake && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
          <div className="relative p-8 bg-white w-full max-w-md mx-auto rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">Update Cake</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              // Handle form submission for update
              const formData = new FormData(e.target as HTMLFormElement);
              const updatedCakeData = {
                name: formData.get('name'),
                type: formData.get('type'),
                price: parseFloat(formData.get('price') as string),
                // image: formData.get('image'), // Image update might need a separate flow
                rating: parseFloat(formData.get('rating') as string),
              };

              try {
                const response = await fetch(`/api/admin/cakes/${selectedCake.id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(updatedCakeData),
                });

                if (response.ok) {
                  setNotification({ message: 'Cake updated successfully!', type: 'success' });
                  handleCloseUpdateModal();
                } else {
                  const errorData = await response.json();
                  setNotification({ message: errorData.error || 'Failed to update cake.', type: 'error' });
                }
              } catch (error) {
                console.error('Error updating cake:', error);
                setNotification({ message: 'An error occurred while updating the cake.', type: 'error' });
              }
            }} className="space-y-4">
              <div>
                <label htmlFor="update-name" className="block text-sm font-medium text-gray-700">Cake Name</label>
                <input
                  type="text"
                  id="update-name"
                  name="name"
                  defaultValue={selectedCake.name}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="update-type" className="block text-sm font-medium text-gray-700">Cake Type</label>
                <input
                  type="text"
                  id="update-type"
                  name="type"
                  defaultValue={selectedCake.type}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="update-price" className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  id="update-price"
                  name="price"
                  defaultValue={selectedCake.price}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="update-rating" className="block text-sm font-medium text-gray-700">Rating</label>
                <input
                  type="number"
                  id="update-rating"
                  name="rating"
                  defaultValue={selectedCake.rating}
                  min="1"
                  max="5"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseUpdateModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {isConfirmModalOpen && cakeToDeleteId && (
        <ConfirmationModal
          message="Are you sure you want to delete this cake?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}
