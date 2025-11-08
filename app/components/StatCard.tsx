'use client';

import React from 'react';
import {
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaShoppingCart,
  FaBirthdayCake,
  FaUsers,
} from 'react-icons/fa';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  gradient: string;
}

export default function StatCard({ title, value, change, icon, gradient }: StatCardProps) {
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
