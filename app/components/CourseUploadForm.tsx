
'use client';

import { useState } from 'react';

export default function CourseUploadForm() {
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseLevel, setCourseLevel] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [courseImage, setCourseImage] = useState<File | null>(null);
  const [courseUploadStatus, setCourseUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [courseUploadMessage, setCourseUploadMessage] = useState('');

  const handleCourseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCourseImage(e.target.files[0]);
    }
  };

  const handleCourseUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !courseDescription || !courseLevel || !coursePrice || !courseImage) {
      setCourseUploadStatus('error');
      setCourseUploadMessage('Please fill in all course fields and select an image.');
      return;
    }

    setCourseUploadStatus('uploading');
    setCourseUploadMessage('');

    const formData = new FormData();
    formData.append('title', courseTitle);
    formData.append('description', courseDescription);
    formData.append('level', courseLevel);
    formData.append('price', coursePrice);
    formData.append('image', courseImage);

    try {
      const response = await fetch('/api/admin/courses/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setCourseUploadStatus('success');
        setCourseUploadMessage('Course uploaded successfully!');
        setCourseTitle('');
        setCourseDescription('');
        setCourseLevel('');
        setCoursePrice('');
        setCourseImage(null);
      } else {
        const errorData = await response.json();
        setCourseUploadStatus('error');
        setCourseUploadMessage(errorData.error || 'Failed to upload course.');
      }
    } catch (error) {
      console.error('Course upload error:', error);
      setCourseUploadStatus('error');
      setCourseUploadMessage('An error occurred during course upload.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Upload New Course</h2>
      <form onSubmit={handleCourseUpload} className="space-y-6">
        <div>
          <label htmlFor="course-title" className="block text-sm font-medium text-gray-700">Course Title</label>
          <input
            type="text"
            id="course-title"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="course-description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="course-description"
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="course-level" className="block text-sm font-medium text-gray-700">Level</label>
          <input
            type="text"
            id="course-level"
            value={courseLevel}
            onChange={(e) => setCourseLevel(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="course-price" className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            id="course-price"
            value={coursePrice}
            onChange={(e) => setCoursePrice(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="course-image" className="block text-sm font-medium text-gray-700">Course Image</label>
          <input
            type="file"
            id="course-image"
            accept="image/*"
            onChange={handleCourseImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          disabled={courseUploadStatus === 'uploading'}
        >
          {courseUploadStatus === 'uploading' ? 'Uploading...' : 'Upload Course'}
        </button>
        {courseUploadStatus !== 'idle' && courseUploadMessage && (
          <p className={`text-center text-sm ${courseUploadStatus === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {courseUploadMessage}
          </p>
        )}
      </form>
    </div>
  );
}
