import React from 'react';
import useSWR from 'swr';
import { Package, X } from 'lucide-react'; // Changed to Package icon for orders
import { formatToKsh } from '@/app/lib/currency';
import { Dialog } from '@headlessui/react';

interface Order {
  id: string;
  status: string;
  total: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  createdAt: string;
}

interface OrdersTabProps {
  userId: string; // Assuming we'll fetch orders for a specific user
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OrdersTab({ userId }: OrdersTabProps) {
  const { data: orders, error, isLoading } = useSWR<Order[]>(`/api/orders/user/${userId}`, fetcher);

  if (error) return <div className="text-center py-12 text-red-600">Failed to load orders</div>;
  if (isLoading) return <div className="text-center py-12">Loading orders...</div>;

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Your Orders</h2>
          <p className="text-xl text-gray-600">Track the status of your recent purchases</p>
        </div>

        {orders && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Order #{order.id.substring(0, 8).toUpperCase()}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="text-gray-600 mb-4">Total: {formatToKsh(order.total)}</p>

                <div className="border-t border-gray-200 pt-4">
                  <p className="font-semibold mb-2">Items:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {order.items.map((item, index) => (
                      <li key={index} className="text-gray-700">
                        {item.name} (x{item.quantity}) - {formatToKsh(item.price)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-xl shadow-inner text-gray-600">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl font-medium">No orders found.</p>
            <p className="text-md">Start shopping to see your orders here!</p>
          </div>
        )}
      </div>
    </div>
  );
}
