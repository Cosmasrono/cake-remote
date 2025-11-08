'use client';

import React from 'react';
import { Cake, ShoppingCart, User, LogOut, Shield } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCartClick: () => void;
}

export default function Header({ activeTab, setActiveTab, onCartClick }: HeaderProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check for ADMIN role (matching UserRole.ADMIN from Prisma)
  const isAdmin = session?.user?.role === 'ADMIN';
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User';

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Cake className="w-10 h-10 text-pink-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Japhee School of Cakes</h1>
              <p className="text-sm text-gray-600"></p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Navigation */}
            <nav className="flex gap-6">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'home'
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-700 hover:bg-pink-100'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('cakes')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'cakes'
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-700 hover:bg-pink-100'
                }`}
              >
                Our Cakes
              </button>
              <button
                onClick={() => setActiveTab('school')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'school'
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-700 hover:bg-pink-100'
                }`}
              >
                Cake School
              </button>
            </nav>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="p-3 rounded-lg bg-pink-100 hover:bg-pink-200 transition relative"
              title="View Cart"
            >
              <ShoppingCart className="w-6 h-6 text-pink-600" />
            </button>

            {/* Authentication Section */}
            {status === 'loading' ? (
              // Loading skeleton
              <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            ) : session?.user ? (
              // User is logged in
              <div className="flex items-center gap-3">
                {/* Admin Dashboard Button - Only visible to ADMIN users */}
                {isAdmin && (
                  <button
                    onClick={() => router.push('/admin/dashboard')}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold shadow-md"
                    title="Go to Admin Dashboard"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </button>
                )}

                {/* User Info */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {userName}
                  </span>
                  {isAdmin && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                      Admin
                    </span>
                  )}
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              // User is not logged in - Show Login Button
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-semibold shadow-md"
                >
                  <User className="w-5 h-5" />
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}