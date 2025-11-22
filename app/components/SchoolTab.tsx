'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Book, Users, ChefHat, Award } from 'lucide-react';

interface SchoolTabProps {
  handleEnrollCourse: (courseId: string) => void;
  isSubmitting: boolean;
  // Removed userId as it is not needed here
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  price: number;
  image?: string;
  duration: string;
}

interface Enrollment {
  id: string;
  courseId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
}

export default function SchoolTab({ handleEnrollCourse, isSubmitting }: SchoolTabProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  // Removed userEnrollments state
  // Removed phoneNumbers state
  const [enrollingCourse, setEnrollingCourse] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Fetch courses
        const coursesResponse = await fetch('/api/courses');
        if (coursesResponse.ok) {
          const coursesData: Course[] = await coursesResponse.json();
          const coursesWithDuration = coursesData.map(course => ({
            ...course,
            duration: course.level === 'Beginner' ? '4 weeks' :
                      course.level === 'Intermediate' ? '6 weeks' :
                      course.level === 'Advanced' ? '8 weeks' : '12 weeks'
          }));
          setCourses(coursesWithDuration);
        } else {
          console.error('Failed to fetch courses.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []); // Removed userId from dependency array

  // Removed getEnrollmentStatus function

  const handleEnrollClick = async (courseId: string) => {
    // No longer handling phone number here
    setEnrollingCourse(courseId);
    handleEnrollCourse(courseId); // Only pass courseId
    setEnrollingCourse(null);
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Cake School Courses</h2>
          <p className="text-xl text-gray-600">Transform your passion into profession</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {courses.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-600 text-lg">No courses available at the moment. Please check back later!</p>
            </div>
          ) : (
            courses.map((course) => {
              // Removed enrollment status logic, as it will be handled by the EnrollmentPopup and backend
              // const enrollment = getEnrollmentStatus(course.id);
              // const isEnrolled = !!enrollment;
              // const isPending = enrollment?.status === 'PENDING';
              // const isApproved = enrollment?.status === 'APPROVED';
              
              return (
                <div key={course.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
                  {course.image && (
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{course.title}</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                        course.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                        course.level === 'Advanced' ? 'bg-purple-100 text-purple-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {course.level}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-pink-600">Ksh {course.price.toFixed(2)}</div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6">{course.description}</p>

                  <div className="flex items-center gap-6 mb-6 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-pink-600" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Book className="w-5 h-5 text-pink-600" />
                      <span>Certificate included</span>
                    </div>
                  </div>

                  {/* Removed phone number input from here, it will be in the EnrollmentPopup */}

                  <button
                    onClick={() => handleEnrollClick(course.id)}
                    disabled={isSubmitting || enrollingCourse === course.id}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                    }`}
                  >
                    {enrollingCourse === course.id
                      ? 'Enrolling...'
                      : 'Enroll in Course'}
                  </button>
                  
                  {/* Removed pending/approved enrollment messages from here */}
                </div>
              );
            })
          )}
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-12">
          <h3 className="text-3xl font-bold text-center mb-8">Why Choose Our Cake School?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Users className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Small Class Sizes</h4>
              <p className="text-gray-700">Maximum 8 students per class for personalized attention</p>
            </div>
            <div className="text-center">
              <ChefHat className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Expert Instructors</h4>
              <p className="text-gray-700">Learn from award-winning pastry chefs</p>
            </div>
            <div className="text-center">
              <Award className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Industry Recognition</h4>
              <p className="text-gray-700">Our certificates are recognized nationwide</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}