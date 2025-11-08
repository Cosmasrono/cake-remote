'use client';

import { useRouter } from 'next/navigation';
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
} from 'react-icons/fa';

interface AdminCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  gradient: string;
  count?: number;
}

export default function AdminCard({ title, description, icon, route, gradient, count }: AdminCardProps) {
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
