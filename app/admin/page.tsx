import { redirect } from 'next/navigation';
import { getSession, isAdmin } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';
import { ShoppingCart, Users, Package, Plus, Image as ImageIcon, BookOpen } from 'lucide-react';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const session = await getSession();
  
  if (!session || !(await isAdmin())) {
    redirect('/login');
  }

  const [users, orders, cartItems, allCakes, allCourses] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.cart.count(),
    prisma.cake.findMany({
      orderBy: { createdAt: 'desc' }
    }),
    prisma.course.findMany({
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-800">{users}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800">{orders}</p>
              </div>
              <Package className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Cart Items</p>
                <p className="text-3xl font-bold text-gray-800">{cartItems}</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-pink-500" />
            </div>
          </div>
        </div>

        {/* Cake Upload Form */}
        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Plus className="w-6 h-6" /> Add New Cake
            </h2>
          </div>
          <form action="/api/admin/cakes/upload" method="POST" encType="multipart/form-data" className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Cake Name" required className="p-3 border rounded-lg" />
              <input type="text" name="type" placeholder="Cake Type" required className="p-3 border rounded-lg" />
              <input type="number" name="price" placeholder="Price" step="0.01" required className="p-3 border rounded-lg" />
              <input type="file" name="image" accept="image/*" required className="p-3 border rounded-lg" />
            </div>
            <button type="submit" className="mt-4 bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700">
              <ImageIcon className="w-5 h-5 inline mr-2" /> Upload Cake
            </button>
          </form>
        </div>

        {/* Course Upload Form */}
        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Plus className="w-6 h-6" /> Add New Course
            </h2>
          </div>
          <form action="/api/admin/courses/upload" method="POST" encType="multipart/form-data" className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" name="title" placeholder="Course Title" required className="p-3 border rounded-lg" />
              <input type="text" name="description" placeholder="Course Description" required className="p-3 border rounded-lg" />
              <input type="text" name="level" placeholder="Course Level" required className="p-3 border rounded-lg" />
              <input type="number" name="price" placeholder="Price" step="0.01" required className="p-3 border rounded-lg" />
              <input type="file" name="image" accept="image/*" className="p-3 border rounded-lg" />
            </div>
            <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              <BookOpen className="w-5 h-5 inline mr-2" /> Upload Course
            </button>
          </form>
        </div>

        {/* Cakes Table */}
        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">All Cakes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allCakes.map((cake) => (
                  <tr key={cake.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{cake.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{cake.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${cake.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img src={cake.image} alt={cake.name} className="w-12 h-12 object-cover rounded" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(cake.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">All Courses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allCourses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{course.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{course.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{course.level}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${course.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {course.image && (
                        <img src={course.image} alt={course.title} className="w-12 h-12 object-cover rounded" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}