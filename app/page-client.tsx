'use client';

import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CakeSchoolWebsite() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession() as { data: Session | null; status: string };
  const [activeTab, updateActiveTab] = useState('home');
  const setActiveTab = (tab: string) => { updateActiveTab(tab); window.history.pushState(null, '', '#' + tab); window.scrollTo({ top: 0, behavior: 'instant' }); };
  useEffect(() => { const sync = () => { const tab = window.location.hash.slice(1); if (['home', 'cakes', 'shawarma', 'burger', 'pizza', 'school', 'courses', 'orders'].includes(tab)) updateActiveTab(tab); else updateActiveTab('home'); }; sync(); window.addEventListener('popstate', sync); window.addEventListener('hashchange', sync); return () => { window.removeEventListener('popstate', sync); window.removeEventListener('hashchange', sync); }; }, []);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showEnrollmentPopup, setShowEnrollmentPopup] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isEnrollSubmitting, setIsEnrollSubmitting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Unified Add to Cart — works for Cakes, Shawarma, Burgers, Pizza
  const askToSignIn = (message = 'Please sign in or create an account to add items to your bag.', returnTo?: string) => {
    showToast(message, 'error');
    setTimeout(() => router.push(returnTo ? '/login?callbackUrl=' + encodeURIComponent(returnTo) : '/login'), 1500);
  };

  const handleAddToCart = async (name: string, cakeType: string, price: number, image: string) => {
    if (!session?.user) return askToSignIn();
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cakeName: name, cakeType, price, image }),
      });

      if (response.status === 401) return askToSignIn();
      const data = await response.json();

      if (response.ok) {
        showToast(`${name} added to cart!`, 'success');
        // Notify Header to refresh cart count
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        showToast(data.error || 'Failed to add item. Try again.', 'error');
      }
    } catch (error) {
      console.error('Cart error:', error);
      showToast('Network error. Please check your connection.', 'error');
    }
  };

  const handleEnrollCourse = (courseId: string) => {
    if (!session?.user?.id) return askToSignIn('Please sign in or create an account to enrol.', '/#school');
    setSelectedCourseId(courseId);
    setShowEnrollmentPopup(true);
  };

  const handleEnrollmentSubmission = async (phoneNumber: string) => {
    setIsEnrollSubmitting(true);
    if (!session?.user?.id) {
      showToast('User not logged in.', 'error');
      setIsEnrollSubmitting(false);
      return;
    }
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseId,
          phoneNumber,
        }),
      });

      if (response.ok) {
        showToast("Enrollment successful! We'll contact you soon.", 'success');
        setShowEnrollmentPopup(false);
        setSelectedCourseId(null);
      } else {
        const data = await response.json();
        showToast(data.error || 'Enrollment failed. Please try again.', 'error');
      }
    } catch (error) {
      showToast('Error occurred. Please try again.', 'error');
    } finally {
      setIsEnrollSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">

      <div className="relative z-10">
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
        <main id="main-content" tabIndex={-1}>
        {['shawarma', 'burger', 'pizza'].includes(activeTab) && <nav className="category-nav" aria-label="Savoury categories">{[['shawarma', 'Shawarma'], ['burger', 'Burgers'], ['pizza', 'Pizza']].map(([id, label]) => <button key={id} aria-current={activeTab === id ? 'page' : undefined} onClick={() => setActiveTab(id)}>{label}</button>)}</nav>}
          <div
            key={activeTab}
            className="pb-10"
          >
            {/* Home */}
            {activeTab === 'home' && <HomeTab setActiveTab={setActiveTab} />}

            {/* Cakes */}
            {activeTab === 'cakes' && (
              <CakesTab handleAddToCart={handleAddToCart} />
            )}

            {/* Shawarma */}
            {activeTab === 'shawarma' && (
              <ShawarmaTab handleAddToCart={handleAddToCart} />
            )}

            {/* Burgers */}
            {activeTab === 'burger' && (
              <BurgerTab handleAddToCart={handleAddToCart} />
            )}

            {/* Pizza */}
            {activeTab === 'pizza' && (
              <PizzaTab handleAddToCart={handleAddToCart} />
            )}

            {/* Baking School */}
            {activeTab === 'school' && (
              <SchoolTab
                handleEnrollCourse={handleEnrollCourse}
                isSubmitting={isEnrollSubmitting}
              />
            )}

            {/* My Courses (Logged-in users only) */}
            {activeTab === 'courses' && session?.user && (
              <CourseTab />
            )}

            {/* Admin Panel (Logged-in users only) */}
            {activeTab === 'admin' && session?.user && (
              <AdminTab showToast={showToast} />
            )}

            {/* Signed-out visitors who open an account-only tab */}
            {['courses', 'orders'].includes(activeTab) && !session?.user && (
              authStatus === 'loading' ? (
                <p className="empty-state" role="status">Loading your account…</p>
              ) : (
                <div className="empty-state">
                  <h2>{activeTab === 'orders' ? 'Sign in to see your orders.' : 'Sign in to see your courses.'}</h2>
                  <p>Your orders and courses are saved to your account.</p>
                  <Link href={'/login?callbackUrl=' + encodeURIComponent('/#' + activeTab)} className="bakery-button">Sign in</Link>
                </div>
              )
            )}

            {/* Track Orders (Logged-in users only) */}
            {activeTab === 'orders' && session?.user && (
              <OrdersTab userId={session.user.id} />
            )}
          </div>
        </main>

        {/* Enrollment Popup */}
        <EnrollmentPopup
          isOpen={showEnrollmentPopup}
          onClose={() => setShowEnrollmentPopup(false)}
          onEnroll={handleEnrollmentSubmission}
          courseId={selectedCourseId}
          userEmail={session?.user?.email || ''}
          userName={session?.user?.name || ''}
          isSubmitting={isEnrollSubmitting}
        />

        {/* Footer */}
        <Footer setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
