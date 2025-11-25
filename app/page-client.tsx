'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import HomeTab from './components/HomeTab';
import CakesTab from './components/CakesTab';
import ShawarmaTab from './components/ShawarmaTab';
import BurgerTab from './components/BurgerTab';
import PizzaTab from './components/PizzaTab';
import SchoolTab from './components/SchoolTab';
import AdminTab from './components/AdminTab';
import CourseTab from './components/CourseTab';
import OrdersTab from './components/OrdersTab';
import Footer from './components/Footer';
import Toast from './components/Toast';
import Cart from './components/Cart';
import EnrollmentPopup from './components/EnrollmentPopup';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

export default function CakeSchoolWebsite() {
  const { data: session } = useSession() as { data: Session | null };
  const [activeTab, setActiveTab] = useState('home');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showEnrollmentPopup, setShowEnrollmentPopup] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Unified Add to Cart — works for Cakes, Shawarma, Burgers, Pizza
  const handleAddToCart = async (name: string, cakeType: string, price: number, image: string) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cakeName: name, cakeType, price, image }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`${name} added to cart!`, 'success');
      } else {
        showToast(data.error || 'Failed to add item. Try again.', 'error');
      }
    } catch (error) {
      console.error('Cart error:', error);
      showToast('Network error. Please check your connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnrollCourse = (courseId: string) => {
    if (!session?.user?.id) {
      showToast('Please log in to enroll.', 'error');
      return;
    }
    setSelectedCourseId(courseId);
    setShowEnrollmentPopup(true);
  };

  const handleEnrollmentSubmission = async (phoneNumber: string) => {
    setIsSubmitting(true);
    // Ensure userId is available before making the API call
    if (!session?.user?.id) {
      showToast('User not logged in.', 'error');
      setIsSubmitting(false);
      return;
    }
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseId,
          userId: session.user.id, // Accessing id directly after check
          email: session.user.email,
          name: session.user.name,
          phoneNumber,
        }),
      });

      if (response.ok) {
        showToast('Enrollment successful! We’ll contact you soon.', 'success');
        setShowEnrollmentPopup(false);
        setSelectedCourseId(null);
      } else {
        showToast('Enrollment failed. Please try again.', 'error');
      }
    } catch (error) {
      showToast('Error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-yellow-50">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Toast Notification */}
      {toast.show && <Toast message={toast.message} type={toast.type} />}

      {/* Cart Sidebar */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Main Content with Smooth Tab Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="pt-20 pb-10" // padding for fixed header
        >
          {/* Home */}
          {activeTab === 'home' && <HomeTab setActiveTab={setActiveTab} />}

          {/* Cakes */}
          {activeTab === 'cakes' && (
            <CakesTab handleAddToCart={handleAddToCart} isSubmitting={isSubmitting} />
          )}

          {/* Shawarma */}
          {activeTab === 'shawarma' && (
            <ShawarmaTab handleAddToCart={handleAddToCart} isSubmitting={isSubmitting} />
          )}

          {/* Burgers */}
          {activeTab === 'burger' && (
            <BurgerTab handleAddToCart={handleAddToCart} isSubmitting={isSubmitting} />
          )}

          {/* Pizza */}
          {activeTab === 'pizza' && (
            <PizzaTab handleAddToCart={handleAddToCart} isSubmitting={isSubmitting} />
          )}

          {/* Baking School */}
          {activeTab === 'school' && (
            <SchoolTab
              handleEnrollCourse={handleEnrollCourse}
              isSubmitting={isSubmitting}
              // Removed userId prop
            />
          )}

          {/* My Courses (Logged-in users only) */}
          {activeTab === 'courses' && session?.user && (
            <CourseTab showToast={showToast} />
          )}

          {/* Admin Panel (Logged-in users only) */}
          {activeTab === 'admin' && session?.user && (
            <AdminTab showToast={showToast} />
          )}

          {/* Track Orders (Logged-in users only) */}
          {activeTab === 'orders' && session?.user && (
            <OrdersTab userId={session.user.id} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Enrollment Popup */}
      <EnrollmentPopup
        isOpen={showEnrollmentPopup}
        onClose={() => setShowEnrollmentPopup(false)}
        onEnroll={handleEnrollmentSubmission}
        courseId={selectedCourseId}
        userEmail={session?.user?.email || ''}
        userName={session?.user?.name || ''}
        isSubmitting={isSubmitting}
      />

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}