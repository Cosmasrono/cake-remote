
'use client';

import { useRouter } from 'next/navigation';
import CourseUploadForm from '@/app/components/CourseUploadForm'; // Adjust path as needed
import { FaArrowLeft } from 'react-icons/fa';

export default function AdminCoursesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Course Management</h1>
          <p className="text-gray-600">Upload new courses and manage existing offerings</p>
        </div>

        {/* Upload Form */}
        <CourseUploadForm />

        {/* Existing Courses List (You can add this later) */}
        <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Existing Courses</h2>
          <p className="text-gray-500">List of existing courses will appear here...</p>
          {/* Add your course list/table component here */}
        </div>
      </div>
    </div>
  );
}
