'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Book, Users, ChefHat, Award, MessageCircle } from 'lucide-react'; // Add MessageCircle

interface SchoolTabProps {
  handleEnrollCourse: (courseId: string) => void;
  isSubmitting: boolean;
  userId: string | undefined;
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

export default function SchoolTab({ handleEnrollCourse, isSubmitting, userId }: SchoolTabProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEnrollments, setUserEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    const fetchCoursesAndEnrollments = async () => {
      setLoading(true);
      try {
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

        if (userId) {
          const enrollmentsResponse = await fetch(`/api/enrollments/user/${userId}`);
          if (enrollmentsResponse.ok) {
            const enrollmentsData: Enrollment[] = await enrollmentsResponse.json();
            setUserEnrollments(enrollmentsData);
          } else {
            console.error('Failed to fetch user enrollments.');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoursesAndEnrollments();
  }, [userId]);

  const getEnrollmentStatus = (courseId: string) => {
    const enrollment = userEnrollments.find(e => e.courseId === courseId);
    return enrollment?.status || null;
  };

  const getButtonConfig = (courseId: string) => {
    if (!userId) {
      return {
        text: 'Log in to Enroll',
        disabled: true,
        className: 'bg-gray-400 cursor-not-allowed'
      };
    }

    if (isSubmitting) {
      return {
        text: 'Enrolling...',
        disabled: true,
        className: 'bg-gray-400 cursor-not-allowed'
      };
    }

    const status = getEnrollmentStatus(courseId);

    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return {
          text: '✓ Enrolled',
          disabled: true,
          className: 'bg-green-600 cursor-not-allowed'
        };
      case 'PENDING':
        return {
          text: '⏳ Enrollment Pending',
          disabled: true,
          className: 'bg-yellow-500 cursor-not-allowed'
        };
      case 'REJECTED':
        return {
          text: 'Enroll Again',
          disabled: false,
          className: 'bg-purple-600 hover:bg-purple-700'
        };
      default:
        return {
          text: 'Enroll in Course',
          disabled: false,
          className: 'bg-purple-600 hover:bg-purple-700'
        };
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-600">Loading courses and enrollments...</p>
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
              const buttonConfig = getButtonConfig(course.id);
              const enrollmentStatus = getEnrollmentStatus(course.id);
              const isApproved = enrollmentStatus === 'APPROVED' || enrollmentStatus === 'COMPLETED';
              
              return (
                <div key={course.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition relative">
                  {/* Status Badge */}
                  {enrollmentStatus && (
                    <div className="absolute top-4 right-4">
                      {isApproved && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                          ✓ Enrolled
                        </span>
                      )}
                      {enrollmentStatus === 'PENDING' && (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                          ⏳ Pending
                        </span>
                      )}
                    </div>
                  )}

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
                      <div className="text-3xl font-bold text-pink-600">${course.price.toFixed(2)}</div>
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

                  <button
                    onClick={() => handleEnrollCourse(course.id)}
                    disabled={buttonConfig.disabled}
                    className={`w-full text-white py-3 rounded-lg font-semibold transition ${buttonConfig.className}`}
                  >
                    {buttonConfig.text}
                  </button>

                  {/* WhatsApp Button - Only show when APPROVED */}
                  {isApproved && (
                    <a
                      href={`https://wa.me/254757450716?text=${encodeURIComponent(`Hi! I'm enrolled in ${course.title}. Please add me to the class group.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Chat on WhatsApp
                    </a>
                  )}

                  {/* Status Messages */}
                  {enrollmentStatus === 'PENDING' && (
                    <p className="text-sm text-yellow-600 mt-2 text-center">
                      Your enrollment is pending admin approval
                    </p>
                  )}
                  {isApproved && (
                    <p className="text-sm text-green-600 mt-2 text-center">
                      ✓ Enrollment approved! Contact us on WhatsApp above
                    </p>
                  )}
                  {enrollmentStatus === 'REJECTED' && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                      Previous enrollment was rejected. You can try again.
                    </p>
                  )}
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