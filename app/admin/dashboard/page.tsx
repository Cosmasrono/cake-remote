'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
  FaEllipsisV
} from 'react-icons/fa';

interface AdminCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  gradient: string;
  count?: number;
}

function AdminCard({ title, description, icon, route, gradient, count }: AdminCardProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(route)}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Gradient Background on Hover */}
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative p-6">
        {/* Icon Section */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl ${gradient} flex items-center justify-center text-white text-2xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          {count !== undefined && (
            <span className="text-2xl font-bold text-gray-800">{count}</span>
          )}
        </div>
        
        {/* Text Section */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
          {description}
        </p>
        
        {/* Arrow Indicator */}
        <div className="mt-4 flex items-center text-gray-400 group-hover:text-gray-600 transition-colors">
          <span className="text-xs font-medium mr-1">Manage</span>
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  gradient: string;
}

function StatCard({ title, value, change, icon, gradient }: StatCardProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center text-white text-xl shadow-md`}>
          {icon}
        </div>
        <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
          {Math.abs(change)}%
        </div>
      </div>
      <h4 className="text-gray-500 text-sm font-medium mb-1">{title}</h4>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const adminSections = [
    {
      title: 'Cake Products',
      description: 'Manage your cake catalog and inventory',
      icon: <FaBirthdayCake />,
      route: '/admin/cakes',
      gradient: 'bg-gradient-to-br from-pink-500 to-rose-600'
    },
    {
      title: 'Courses',
      description: 'Manage training programs and schedules',
      icon: <FaGraduationCap />,
      route: '/admin/courses',
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    },
    {
      title: 'User Management',
      description: 'Control user accounts and permissions',
      icon: <FaUsers />,
      route: '/admin/users',
      gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600'
    },
    {
      title: 'Order Management',
      description: 'Track and fulfill customer orders',
      icon: <FaShoppingCart />,
      route: '/admin/orders',
      gradient: 'bg-gradient-to-br from-purple-500 to-violet-600'
    },
    {
      title: 'Analytics Hub',
      description: 'View insights and performance metrics',
      icon: <FaChartLine />,
      route: '/admin/analytics',
      gradient: 'bg-gradient-to-br from-cyan-500 to-blue-600'
    },
    {
      title: 'Media Gallery',
      description: 'Organize photos and visual content',
      icon: <FaImages />,
      route: '/admin/gallery',
      gradient: 'bg-gradient-to-br from-orange-500 to-amber-600'
    },
    {
      title: 'Blog & News',
      description: 'Publish articles and updates',
      icon: <FaNewspaper />,
      route: '/admin/blog',
      gradient: 'bg-gradient-to-br from-teal-500 to-emerald-600'
    },
    {
      title: 'Promotions',
      description: 'Create campaigns and discount codes',
      icon: <FaTags />,
      route: '/admin/promotions',
      gradient: 'bg-gradient-to-br from-red-500 to-pink-600'
    },
    {
      title: 'Customer Reviews',
      description: 'Monitor feedback and testimonials',
      icon: <FaComments />,
      route: '/admin/reviews',
      gradient: 'bg-gradient-to-br from-yellow-500 to-orange-600'
    },
    {
      title: 'System Settings',
      description: 'Configure platform preferences',
      icon: <FaCog />,
      route: '/admin/settings',
      gradient: 'bg-gradient-to-br from-slate-500 to-gray-600'
    }
  ];

  // TODO: Replace with dynamic data from API/database
  const stats = [
    {
      title: 'Total Revenue',
      value: '---',
      change: 0,
      icon: <FaChartLine />,
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    },
    {
      title: 'Active Orders',
      value: '---',
      change: 0,
      icon: <FaShoppingCart />,
      gradient: 'bg-gradient-to-br from-purple-500 to-violet-600'
    },
    {
      title: 'Total Products',
      value: '---',
      change: 0,
      icon: <FaBirthdayCake />,
      gradient: 'bg-gradient-to-br from-pink-500 to-rose-600'
    },
    {
      title: 'Active Users',
      value: '---',
      change: 0,
      icon: <FaUsers />,
      gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600'
    }
  ];

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
            <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">View All</button>
          </div>
          {/* TODO: Replace with dynamic activity data from API/database */}
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-400">
              <p>No recent activity to display</p>
              <p className="text-sm mt-2">Activity will appear here once actions are performed</p>
            </div>
          </div>
          
          {/* Commented out hardcoded data - replace with dynamic data
          <div className="space-y-4">
            {[
              { action: 'New order placed', time: '2 minutes ago', icon: <FaShoppingCart />, color: 'bg-purple-100 text-purple-600' },
              { action: 'User registered', time: '15 minutes ago', icon: <FaUsers />, color: 'bg-blue-100 text-blue-600' },
              { action: 'Product updated', time: '1 hour ago', icon: <FaBirthdayCake />, color: 'bg-pink-100 text-pink-600' },
              { action: 'New review posted', time: '3 hours ago', icon: <FaComments />, color: 'bg-yellow-100 text-yellow-600' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <FaEllipsisV />
                </button>
              </div>
            ))}
          </div>
          */}
        </div>
      </div>
    </div>
  );
}