'use client';

import React from 'react';
import { Cake } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export default function Footer({ setActiveTab }: FooterProps) {
  return (
    <footer className="bg-gray-800 text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Cake className="w-8 h-8 text-pink-400" />
              <h3 className="text-xl font-bold">Sweet Dreams</h3>
            </div>
            <p className="text-gray-400">Creating sweet memories since 2020</p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => setActiveTab('home')} className="hover:text-white">Home</button></li>
              <li><button onClick={() => setActiveTab('cakes')} className="hover:text-white">Our Cakes</button></li>
              <li><button onClick={() => setActiveTab('school')} className="hover:text-white">Cake School</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@sweetdreams.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Address: 123 Baker Street</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Sweet Dreams Bakery & Cake Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}  