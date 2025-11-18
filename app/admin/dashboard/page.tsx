import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import React from 'react';
import {
  FaBirthdayCake,
  FaGraduationCap,
  FaUsers,
  FaShoppingCart,
  FaChartLine,
  FaCog,
  FaImages,
  FaNewspaper,
  FaTags,
  FaComments,
  FaBell,
  FaSearch,
  FaUserCircle,
  FaArrowUp,
  FaArrowDown,
  FaEllipsisV,
} from 'react-icons/fa';
import AdminCard from '@/app/components/AdminCard';
import StatCard from '@/app/components/StatCard';

const prisma = new PrismaClient();

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect('/login');
  }

  const [
    usersCount,
    ordersCount,
    cartItemsCount,
    allCakes,
    allCourses,
    allUsers,
    allEnrollments, // Changed from pendingEnrollments
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.cart.count(),
    prisma.cake.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.course.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
    // Fetch ALL enrollments, not just pending
    prisma.enrollment.findMany({
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    }),
  ]);

  const pendingCount = allEnrollments.filter(e => e.status === 'PENDING').length;

  const adminSections = [
    {
      title: 'Cake Products',
      description: 'Manage your cake catalog and inventory',
      icon: <FaBirthdayCake />,
      route: '/admin/cakes',
      gradient: 'bg-gradient-to-br from-pink-500 to-rose-600',
    },
    {
      title: 'Courses',
      description: 'Manage training programs and schedules',
      icon: <FaGraduationCap />,
      route: '/admin/courses',
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      count: allCourses.length,
    },
    {
      title: 'User Management',
      description: 'Control user accounts and permissions',
      icon: <FaUsers />,
      route: '/admin/users',
      gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      count: usersCount,
    },
    {
      title: 'Order Management',
      description: 'Track and fulfill customer orders',
      icon: <FaShoppingCart />,
      route: '/admin/orders',
      gradient: 'bg-gradient-to-br from-purple-500 to-violet-600',
      count: ordersCount,
    },
    {
      title: 'Analytics Hub',
      description: 'View insights and performance metrics',
      icon: <FaChartLine />,
      route: '/admin/analytics',
      gradient: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    },
    {
      title: 'Media Gallery',
      description: 'Organize photos and visual content',
      icon: <FaImages />,
      route: '/admin/gallery',
      gradient: 'bg-gradient-to-br from-orange-500 to-amber-600',
    },
    {
      title: 'Blog & News',
      description: 'Publish articles and updates',
      icon: <FaNewspaper />,
      route: '/admin/blog',
      gradient: 'bg-gradient-to-br from-teal-500 to-emerald-600',
    },
    {
      title: 'Promotions',
      description: 'Create campaigns and discount codes',
      icon: <FaTags />,
      route: '/admin/promotions',
      gradient: 'bg-gradient-to-br from-red-500 to-pink-600',
    },
    {
      title: 'Customer Reviews',
      description: 'Monitor feedback and testimonials',
      icon: <FaComments />,
      route: '/admin/reviews',
      gradient: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    },
    {
      title: 'System Settings',
      description: 'Configure platform preferences',
      icon: <FaCog />,
      route: '/admin/settings',
      gradient: 'bg-gradient-to-br from-slate-500 to-gray-600',
    },
  ];

  const stats = [
    {
      title: 'Total Users',
      value: usersCount,
      change: 0,
      icon: <FaUsers />,
      gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    },
    {
      title: 'Total Orders',
      value: ordersCount,
      change: 0,
      icon: <FaShoppingCart />,
      gradient: 'bg-gradient-to-br from-purple-500 to-violet-600',
    },
    {
      title: 'Total Cakes',
      value: allCakes.length,
      change: 0,
      icon: <FaBirthdayCake />,
      gradient: 'bg-gradient-to-br from-pink-500 to-rose-600',
    },
    {
      title: 'Pending Enrollments',
      value: pendingCount,
      change: 0,
      icon: <FaGraduationCap />,
      gradient: 'bg-gradient-to-br from-orange-500 to-amber-600',
    },
  ];

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaBirthdayCake className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Japhee Admin</h1>
                <p className="text-xs text-gray-500">Dashboard Control Panel</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors">
                <FaBell className="text-xl" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <FaUserCircle className="text-3xl text-gray-600" />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-800">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, Admin</h2>
          <p className="text-gray-600">Here's what's happening with your business today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              gradient={stat.gradient}
            />
          ))}
        </div>

        {/* Section Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Quick Actions</h3>
          <p className="text-gray-600">Manage different aspects of your platform</p>
        </div>

        {/* Admin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {adminSections.map((section, index) => (
            <AdminCard
              key={index}
              title={section.title}
              description={section.description}
              icon={section.icon}
              route={section.route}
              gradient={section.gradient}
              count={section.count}
            />
          ))}
        </div>

        {/* All Enrollments Table */}
        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">All Enrollments</h2>
            <p className="text-sm text-gray-500 mt-1">Manage and track all course enrollments</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No enrollments found.</td>
                  </tr>
                ) : (
                  allEnrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{enrollment.course.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{enrollment.user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{enrollment.user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{enrollment.phoneNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(enrollment.status)}`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {enrollment.status === 'PENDING' ? (
                          <>
                            <form action="/api/admin/enrollments/approve" method="POST" className="inline-block mr-2">
                              <input type="hidden" name="enrollmentId" value={enrollment.id} />
                              <button
                                type="submit"
                                className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md transition-colors"
                              >
                                Approve
                              </button>
                            </form>
                            <form action="/api/admin/enrollments/reject" method="POST" className="inline-block">
                              <input type="hidden" name="enrollmentId" value={enrollment.id} />
                              <button
                                type="submit"
                                className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors"
                              >
                                Reject
                              </button>
                            </form>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">No actions available</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
            <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-400">
              <p>No recent activity to display</p>
              <p className="text-sm mt-2">Activity will appear here once actions are performed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}