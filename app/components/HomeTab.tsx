'use client';

import React from 'react';
import { Cake, GraduationCap, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomeTabProps {
  setActiveTab: (tab: string) => void;
}

export default function HomeTab({ setActiveTab }: HomeTabProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        delayChildren: 0.2, 
        staggerChildren: 0.1 
      } 
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative text-white py-24 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/cake2.jpg')` }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.h2
            className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg"
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Welcome to Japhee School of Cakes
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-md"
            initial="hidden"
            animate="visible"
            variants={itemVariants}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Where passion for baking meets professional training. Enroll in our courses to create your own masterpieces!
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={() => setActiveTab('cakes')}
              className="bg-white text-pink-600 px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-pink-50 transition transform hover:scale-105"
              variants={itemVariants}
            >
              Order Cakes
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('school')}
              className="bg-purple-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-purple-800 transition transform hover:scale-105"
              variants={itemVariants}
            >
              Enroll Now
            </motion.button>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-black opacity-10"></div> {/* Lighter overlay for clearer background */}
      </section>

      {/* About Us Section */}
      <motion.section
        className="py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h2
            className="text-4xl font-bold text-gray-800 mb-12"
            variants={itemVariants}
          >
            Our Passion for Perfection at Japhee School of Cakes
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div className="text-left" variants={itemVariants}>
              <p className="text-lg text-gray-700 mb-6">
                At Japhee School of Cakes, we believe that every cake tells a story. Founded with a passion for baking and a commitment to excellence, we&apos;ve been crafting exquisite cakes for all occasions for over a decade. Our master bakers use only the finest ingredients, ensuring every bite is a delightful experience.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Beyond our delectable creations, we are dedicated to fostering new talent through our comprehensive baking school. Whether you&apos;re a beginner or an aspiring professional, our expert-led courses provide the skills and inspiration you need to turn your sweet dreams into reality.
              </p>
              <button
                onClick={() => setActiveTab('school')}
                className="mt-6 bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition transform hover:scale-105"
              >
                Learn More About Our School
              </button>
            </motion.div>
            <motion.div variants={itemVariants}>
              {/* Beautiful cake image from Unsplash (free to use, no attribution required) */}
              <img
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80"
                alt="Beautiful decorated cake with colorful frosting"
                className="rounded-2xl h-64 w-full object-cover shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-16 max-w-7xl mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        variants={containerVariants}
      >
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div className="bg-white p-8 rounded-2xl shadow-lg text-center" variants={itemVariants}>
            <Cake className="w-16 h-16 text-pink-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">Artisan Cakes</h3>
            <p className="text-gray-600">Handcrafted cakes made with premium ingredients and love</p>
          </motion.div>
          <motion.div className="bg-white p-8 rounded-2xl shadow-lg text-center" variants={itemVariants}>
            <GraduationCap className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">Expert Training</h3>
            <p className="text-gray-600">Learn from professional pastry chefs with years of experience</p>
          </motion.div>
          <motion.div className="bg-white p-8 rounded-2xl shadow-lg text-center" variants={itemVariants}>
            <Award className="w-16 h-16 text-pink-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-3">Certification</h3>
            <p className="text-gray-600">Get certified and start your own baking business</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Featured Courses Section */}
      <motion.section
        className="py-20 bg-gradient-to-r from-purple-50 to-pink-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h2
            className="text-4xl font-bold text-gray-800 mb-12"
            variants={itemVariants}
          >
            Our Featured Courses
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Course Card 1 */}
            <motion.div className="bg-white p-8 rounded-2xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out" variants={itemVariants}>
              <img src="/images/course1.jpg" alt="Beginner Baking Course" className="rounded-xl mb-6 w-full h-48 object-cover" />
              <h3 className="text-2xl font-bold mb-3 text-purple-700">Beginner's Delight: Baking Fundamentals</h3>
              <p className="text-gray-600 mb-4">Master the basics of baking, from essential techniques to delicious recipes.</p>
              <button
                onClick={() => setActiveTab('school')}
                className="bg-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-700 transition transform hover:scale-105"
              >
                View Course
              </button>
            </motion.div>

            {/* Course Card 2 */}
            <motion.div className="bg-white p-8 rounded-2xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out" variants={itemVariants}>
              <img src="/images/course2.jpg" alt="Advanced Cake Decoration" className="rounded-xl mb-6 w-full h-48 object-cover" />
              <h3 className="text-2xl font-bold mb-3 text-pink-700">Art of Decor: Advanced Cake Techniques</h3>
              <p className="text-gray-600 mb-4">Elevate your cake decorating skills with intricate designs and professional finishes.</p>
              <button
                onClick={() => setActiveTab('school')}
                className="bg-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-700 transition transform hover:scale-105"
              >
                View Course
              </button>
            </motion.div>

            {/* Course Card 3 */}
            <motion.div className="bg-white p-8 rounded-2xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out" variants={itemVariants}>
              <img src="/images/course3.jpg" alt="Pastry Arts Masterclass" className="rounded-xl mb-6 w-full h-48 object-cover" />
              <h3 className="text-2xl font-bold mb-3 text-purple-700">Professional Pastry Arts Masterclass</h3>
              <p className="text-gray-600 mb-4">A comprehensive program for aspiring pastry chefs, covering a wide range of desserts.</p>
              <button
                onClick={() => setActiveTab('school')}
                className="bg-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-700 transition transform hover:scale-105"
              >
                View Course
              </button>
            </motion.div>
          </div>
          <motion.button
            onClick={() => setActiveTab('school')}
            className="mt-12 bg-pink-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-pink-700 transition transform hover:scale-105"
            variants={itemVariants}
          >
            Explore All Courses
          </motion.button>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        className="py-20 bg-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.h2
            className="text-4xl font-bold text-gray-800 mb-12"
            variants={itemVariants}
          >
            What Our Customers Say
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div className="bg-white p-8 rounded-2xl shadow-lg" variants={itemVariants}>
              <p className="text-gray-700 italic mb-4">"The cakes from Japhee School of Cakes are simply divine! Every bite is a piece of heaven. Highly recommend for any occasion."</p>
              <p className="font-bold text-pink-600">- Jane Doe</p>
            </motion.div>
            <motion.div className="bg-white p-8 rounded-2xl shadow-lg" variants={itemVariants}>
              <p className="text-gray-700 italic mb-4">"I took their advanced pastry course and my baking skills have transformed! The instructors are amazing and truly passionate."</p>
              <p className="font-bold text-purple-600">- John Smith</p>
            </motion.div>
            <motion.div className="bg-white p-8 rounded-2xl shadow-lg" variants={itemVariants}>
              <p className="text-gray-700 italic mb-4">"From ordering my wedding cake to enrolling in a class, Japhee School of Cakes exceeded all my expectations. A truly delightful experience!"</p>
              <p className="font-bold text-pink-600">- Emily White</p>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}