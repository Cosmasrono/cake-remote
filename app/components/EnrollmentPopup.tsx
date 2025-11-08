'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EnrollmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (phoneNumber: string) => void;
  courseId: string | null;
  userEmail: string;
  userName: string;
  isSubmitting: boolean;
}

export default function EnrollmentPopup({
  isOpen,
  onClose,
  onEnroll,
  courseId,
  userEmail,
  userName,
  isSubmitting,
}: EnrollmentPopupProps) {
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setPhoneNumber(''); // Reset phone number when popup closes
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseId && userEmail && userName && phoneNumber) {
      onEnroll(phoneNumber);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Enroll in Course</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">Course ID</label>
            <input
              type="text"
              id="courseId"
              value={courseId || ''}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
            />
          </div>
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700">Your Name</label>
            <input
              type="text"
              id="userName"
              value={userName}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
            />
          </div>
          <div>
            <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">Your Email</label>
            <input
              type="email"
              id="userEmail"
              value={userEmail}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="e.g., +15551234567"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !phoneNumber.trim()}
            className="w-full bg-pink-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-pink-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Request for Enrollment'}
          </button>
        </form>
      </div>
    </div>
  );
}
