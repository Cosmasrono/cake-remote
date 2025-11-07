'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit } from 'lucide-react';

interface CourseTabProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  price: number;
  image?: string;
  createdAt: string;
}

export default function CourseTab({ showToast }: CourseTabProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        showToast('Failed to fetch courses.', 'error');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      showToast('An error occurred while fetching courses.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title, 
          description, 
          level, 
          price: parseFloat(price), 
          image: image || undefined 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`Course '${title}' created successfully!`, 'success');
        setTitle('');
        setDescription('');
        setLevel('Beginner');
        setPrice('');
        setImage('');
        fetchCourses(); // Refresh courses list
        router.refresh();
      } else {
        showToast(data.error || 'Failed to create course. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Course deleted successfully!', 'success');
        fetchCourses();
      } else {
        showToast('Failed to delete course.', 'error');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast('An error occurred while deleting.', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Course Management</h2>

      {/* Create New Course Form */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Create New Course</h3>
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-md">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              id="title"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Beginner Cake Decorating"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Describe what students will learn in this course..."
            ></textarea>
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
              Level *
            </label>
            <select
              id="level"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Professional">Professional</option>
            </select>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price ($) *
            </label>
            <input
              type="number"
              id="price"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
              placeholder="299.99"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL (Optional)
            </label>
            <input
              type="url"
              id="image"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/course-image.jpg"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white p-3 rounded-md font-semibold hover:bg-purple-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </div>

      {/* Existing Courses */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Existing Courses</h3>
        {loading ? (
          <p className="text-gray-600 text-center py-8">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No courses available. Create one above!</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-gray-50 p-6 rounded-md shadow-sm border border-gray-200 relative">
                {course.image && (
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-40 object-cover rounded-md mb-4" 
                  />
                )}
                <h4 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h4>
                <p className="text-gray-600 mb-2 line-clamp-3">{course.description}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                    course.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                    course.level === 'Advanced' ? 'bg-purple-100 text-purple-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {course.level}
                  </span>
                  <p className="text-lg font-semibold text-purple-600">${course.price.toFixed(2)}</p>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Created: {new Date(course.createdAt).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="w-full bg-red-500 text-white py-2 rounded-md font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Course
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}