// app/admin/custom-orders/page.tsx
import { PrismaClient } from '@prisma/client';
import Image from 'next/image';

const prisma = new PrismaClient();

export const revalidate = 10; // Refresh every 10 seconds

export default async function CustomOrdersPage() {
  const orders = await prisma.customOrder.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Custom Cake Orders</h1>

        {orders.length === 0 ? (
          <p className="text-xl text-gray-600">No custom orders yet.</p>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{order.name}</h3>
                    <p className="text-lg text-gray-700">{order.phone}</p>
                    <p className="text-sm text-gray-500">Received: {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <p><strong>Occasion:</strong> {order.occasion || 'Not specified'}</p>
                    <p><strong>Delivery Date:</strong> {order.date || 'Not specified'}</p>
                    <p><strong>Flavor:</strong> {order.flavor || 'Any'}</p>
                    <p><strong>Size:</strong> {order.size || 'Not specified'}</p>
                    {order.message && <p><strong>Message:</strong> {order.message}</p>}
                    {order.inspirationLink && (
                      <p>
                        <strong>Link:</strong>{' '}
                        <a href={order.inspirationLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          View Inspiration
                        </a>
                      </p>
                    )}
                  </div>

                  {order.image && (
                    <div className="relative h-64 rounded-xl overflow-hidden shadow-md">
                      <Image
                        src={order.image}
                        alt="Customer inspiration"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}