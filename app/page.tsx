'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import HomeTab from './components/HomeTab';
import CakesTab from './components/CakesTab';
import SchoolTab from './components/SchoolTab';
import AdminTab from './components/AdminTab';
import Footer from './components/Footer';
import Toast from './components/Toast';
import Cart from './components/Cart';
import CourseTab from './components/CourseTab';
import { useSession } from 'next-auth/react';

export default function CakeSchoolWebsite() {
  const { data: session } = useSession(); 
  const [activeTab, setActiveTab] = useState('home');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleAddToCart = async (cakeName: string, cakeType: string, price: number, image: string) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cakeName, cakeType, price, image }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`${cakeName} added to cart! 🛒`, 'success');
      } else {
        showToast(data.error || 'Failed to add to cart. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnrollCourse = async (courseId: string) => {
    setIsSubmitting(true);
    
    if (!session?.user?.id) {
      showToast('Please log in to enroll in a course.', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, userId: session.user.id }),
      });

      if (response.ok) {
        showToast('Enrollment successful! 🎓', 'success');
      } else {
        showToast('Failed to enroll. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      {toast.show && <Toast message={toast.message} type={toast.type} />}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab} // Important for AnimatePresence to track individual components
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-screen"
        >
          {activeTab === 'home' && <HomeTab setActiveTab={setActiveTab} />}
          
          {activeTab === 'cakes' && (
            <CakesTab 
              handleAddToCart={handleAddToCart} 
              isSubmitting={isSubmitting} 
            />
          )}
          
          {activeTab === 'school' && (
            <SchoolTab 
              handleEnrollCourse={handleEnrollCourse} 
              isSubmitting={isSubmitting} 
              userId={session?.user?.id}
            />
          )}

          {activeTab === 'admin' && session?.user && (
            <AdminTab showToast={showToast} />
          )}

          {activeTab === 'courses' && session?.user && (
            <CourseTab showToast={showToast} />
          )}
        </motion.div>
      </AnimatePresence>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}