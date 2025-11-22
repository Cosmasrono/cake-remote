'use client';

import React from 'react';
import { Cake, ShoppingCart, User, LogOut, Shield, Pizza, Beef, Flame, Truck } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCartClick: () => void;
}

export default function Header({ activeTab, setActiveTab, onCartClick }: HeaderProps) {
  const { data: session, status } = useSession() as { data: Session | null; status: 'loading' | 'authenticated' | 'unauthenticated' };
  const router = useRouter();
  
  const handleLogin = () => signIn();
  const handleLogout = () => signOut();
  const handleAdminClick = () => router.push('/admin/dashboard');

  const isAdmin = session?.user?.role === 'ADMIN';
  const userName = session?.user?.name || 'User';

  const navItems = [
    { id: 'home', label: 'Home', icon: null },
    { id: 'cakes', label: 'Our Cakes', icon: Cake },
    { id: 'shawarma', label: 'Shawarma', icon: Flame },
    { id: 'burger', label: 'Burgers', icon: Beef },
    { id: 'pizza', label: 'Pizza', icon: Pizza },
    { id: 'school', label: 'Cake School', icon: null },
    { id: 'orders', label: 'Track Orders', icon: Truck },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">

          {/* Logo - Compact */}
          <div className="flex items-center gap-3 cursor-pointer flex-shrink-0" onClick={() => setActiveTab('home')}>
            <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg">
              <Cake className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                Japhee
              </h1>
              {/* <p className="text-xs text-gray-500 hidden xl:block">Cakes • Shawarma • Burgers • Pizza • Baking School</p> */}
            </div>
          </div>

          {/* Desktop Navigation - Compact */}
          <nav className="hidden lg:flex items-center gap-1 bg-gray-50/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-pink-100 hover:text-pink-700'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Side: Cart + Auth - Compact */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-2.5 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl hover:shadow-xl transition-all hover:scale-110 group"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5 text-pink-600 group-hover:text-purple-600 transition" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                3
              </span>
            </button>

            {/* Auth Section */}
            {status === 'loading' ? (
              <div className="w-24 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session?.user ? (
              <div className="flex items-center gap-2">
                {/* Admin Button */}
                {isAdmin && (
                  <button
                    onClick={handleAdminClick}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-bold hover:shadow-xl transition-all hover:scale-105"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="hidden xl:inline">Admin</span>
                  </button>
                )}

                {/* User Greeting */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {userName[0].toUpperCase()}
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-xs font-semibold text-gray-800">Hi, {userName}!</p>
                    {isAdmin && <p className="text-xs text-purple-600 font-bold">Admin</p>}
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 whitespace-nowrap"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Login / Sign Up</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden mt-3 flex flex-wrap justify-center gap-2 bg-gray-50 rounded-xl p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'bg-white text-gray-700 shadow-md'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}