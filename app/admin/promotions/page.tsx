import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { Megaphone, Plus } from 'lucide-react';

const prisma = new PrismaClient();

export default async function PromotionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') redirect('/login');

  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
              <Megaphone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Promotions & Announcements</h1>
              <p className="text-gray-600">Create banners that appear on the website</p>
            </div>
          </div>
        </div>

        {/* Create New Promotion Form */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6" /> Create New Promotion
          </h2>
          <form action="/api/admin/promotions/create" method="POST" className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promotion Message
              </label>
              <input
                name="message"
                type="text"
                required
                placeholder="e.g. 20% OFF all cakes this weekend! Use code: SWEET20"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="active" defaultChecked className="w-5 h-5 text-pink-600 rounded" />
                <span className="text-sm font-medium">Show on website</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-shadow"
            >
              Publish Promotion
            </button>
          </form>
        </div>

        {/* Active Promotions List */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-xl font-bold">Active Promotions</h2>
          </div>
          <div className="divide-y">
            {promotions.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No promotions yet. Create one above!</p>
              </div>
            ) : (
              promotions.map((promo) => (
                <div key={promo.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <p className={`font-medium text-lg ${promo.active ? 'text-gray-900' : 'text-gray-400'}`}>
                      {promo.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Created {new Date(promo.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${promo.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {promo.active ? 'Live' : 'Hidden'}
                    </span>
                    <form action="/api/admin/promotions/delete" method="POST">
                      <input type="hidden" name="id" value={promo.id} />
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}