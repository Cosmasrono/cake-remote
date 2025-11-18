'use client';

import React from 'react';
import { Cake, GraduationCap, Award, ChefHat, Sparkles, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomeTabProps {
  setActiveTab: (tab: string) => void;
}

export default function HomeTab({ setActiveTab }: HomeTabProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delayChildren: 0.3,
        staggerChildren: 0.2
      } 
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const scaleOnHover = {
    scale: 1.05,
    transition: { type: "spring", stiffness: 300 }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Parallax Effect */}
      <section className="relative text-white py-32 bg-cover bg-center bg-fixed overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&q=80')`,
            filter: 'brightness(0.7)'
          }}
        />
        
        {/* Animated Gradient Overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-pink-600/40 via-purple-600/40 to-pink-600/40"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ backgroundSize: '200% 200%' }}
        />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <Sparkles className="w-16 h-16 mx-auto text-yellow-300" />
          </motion.div>

          <motion.h2
            className="text-6xl md:text-7xl font-extrabold mb-6 drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-white"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Welcome to Japhee School of Cakes
          </motion.h2>

          <motion.p
            className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Where passion for baking meets professional training. Create masterpieces that delight!
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <motion.button
              onClick={() => setActiveTab('cakes')}
              className="group relative bg-white text-pink-600 px-12 py-5 rounded-full font-bold text-lg shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(236, 72, 153, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Cake className="w-5 h-5" />
                Order Cakes
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-400 to-pink-600"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('school')}
              className="group relative bg-purple-600 text-white px-12 py-5 rounded-full font-bold text-lg shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(147, 51, 234, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Enroll Now
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-700 to-purple-900"
                initial={{ x: "-100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* About Us Section with Scroll Animation */}
      <motion.section
        className="py-24 bg-gradient-to-b from-white to-pink-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="text-center mb-16" variants={itemVariants as any}>
            <motion.div
              animate={{
                y: [0, -10, 0],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut" as any,
                },
              }}
              className="inline-block mb-4"
            >
              <Heart className="w-12 h-12 text-pink-500 mx-auto" />
            </motion.div>
            <h2 className="text-5xl font-bold text-gray-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
              Our Passion for Perfection
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants as any} className="space-y-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                At <span className="font-bold text-pink-600">Japhee School of Cakes</span>, we believe that every cake tells a story. Founded with a passion for baking and a commitment to excellence, we've been crafting exquisite cakes for all occasions for over a decade.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our master bakers use only the finest ingredients, ensuring every bite is a delightful experience. From elegant wedding cakes to playful birthday creations, we bring your sweet dreams to life.
              </p>
              <motion.div
                className="flex gap-4 pt-4"
                variants={containerVariants}
              >
                {[
                  { icon: ChefHat, text: "Expert Chefs", color: "pink" },
                  { icon: Award, text: "Award Winning", color: "purple" },
                  { icon: Star, text: "5-Star Rated", color: "yellow" }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-md"
                    whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                  >
                    <item.icon className={`w-5 h-5 text-${item.color}-500`} />
                    <span className="text-sm font-semibold text-gray-700">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
              <motion.button
                onClick={() => setActiveTab('school')}
                className="mt-6 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-10 py-4 rounded-full font-semibold shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Our School
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants as any} className="relative">
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-3xl opacity-20 blur-2xl"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
              />
              <motion.img
                src="https://images.unsplash.com/photo-1588195538326-c5aee37a8d00?w=800&q=80"
                alt="Beautiful decorated cake"
                className="relative rounded-3xl shadow-2xl w-full h-96 object-cover"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section with Card Animations */}
      <motion.section
        className="py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Cake,
                title: "Artisan Cakes",
                desc: "Handcrafted masterpieces with premium ingredients",
                color: "from-pink-500 to-rose-500",
                image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80"
              },
              {
                icon: GraduationCap,
                title: "Expert Training",
                desc: "Learn from award-winning pastry chefs",
                color: "from-purple-500 to-indigo-500",
                image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80"
              },
              {
                icon: Award,
                title: "Certification",
                desc: "Get certified and launch your career",
                color: "from-pink-500 to-purple-500",
                image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants as any}
                className="group relative bg-white rounded-3xl shadow-lg overflow-hidden"
                whileHover={{ y: -10, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
              >
                <div className="relative h-48 overflow-hidden">
                  <motion.img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${feature.color} opacity-60`} />
                  <feature.icon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white" />
                </div>
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Courses with Image Gallery */}
      <motion.section
        className="py-24 bg-gradient-to-br from-purple-50 via-pink-50 to-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="text-center mb-16" variants={itemVariants as any}>
            <h2 className="text-5xl font-bold text-gray-800 mb-4">Featured Courses</h2>
            <p className="text-xl text-gray-600">Transform your passion into profession</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Beginner's Delight",
                subtitle: "Baking Fundamentals",
                desc: "Master essential techniques and classic recipes",
                image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&q=80",
                color: "purple"
              },
              {
                title: "Art of Decor",
                subtitle: "Advanced Cake Design",
                desc: "Create stunning decorative masterpieces",
                image: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600&q=80",
                color: "pink"
              },
              {
                title: "Pastry Masterclass",
                subtitle: "Professional Techniques",
                desc: "Comprehensive training for aspiring chefs",
                image: "https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=600&q=80",
                color: "purple"
              }
            ].map((course, i) => (
              <motion.div
                key={i}
                variants={itemVariants as any}
                className="group bg-white rounded-3xl shadow-xl overflow-hidden"
                whileHover={{ y: -15, boxShadow: "0 30px 60px rgba(0,0,0,0.2)" }}
              >
                <div className="relative h-64 overflow-hidden">
                  <motion.img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.15, rotate: 2 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-t from-${course.color}-900 via-${course.color}-500/50 to-transparent opacity-0 group-hover:opacity-100`}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="p-8">
                  <h3 className={`text-2xl font-bold mb-2 text-${course.color}-700`}>{course.title}</h3>
                  <p className="text-gray-600 font-semibold mb-3">{course.subtitle}</p>
                  <p className="text-gray-600 mb-6">{course.desc}</p>
                  <motion.button
                    onClick={() => setActiveTab('school')}
                    className={`w-full bg-gradient-to-r from-${course.color}-600 to-${course.color}-700 text-white px-6 py-3 rounded-full font-semibold`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Learn More
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div className="text-center mt-16">
            <motion.button
              onClick={() => setActiveTab('school')}
              className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 text-white px-16 py-5 rounded-full font-bold text-lg shadow-2xl"
              whileHover={{ scale: 1.05, backgroundPosition: "right center" }}
              whileTap={{ scale: 0.95 }}
              style={{ backgroundSize: "200% auto" }}
            >
              Explore All Courses
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials with Animated Cards */}
      <motion.section
        className="py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-4">What Our Students Say</h2>
            <p className="text-xl text-gray-600">Success stories from our community</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "The cakes are simply divine! Every bite is pure heaven. Perfect for any occasion!",
                name: "Jane Doe",
                role: "Happy Customer",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
                rating: 5
              },
              {
                text: "The pastry course transformed my skills! The instructors are amazing and truly passionate.",
                name: "John Smith",
                role: "Course Graduate",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
                rating: 5
              },
              {
                text: "From wedding cake to baking classes - Japhee exceeded all expectations! Truly delightful!",
                name: "Emily White",
                role: "Bride & Student",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
                rating: 5
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-gradient-to-br from-pink-50 to-purple-50 p-8 rounded-3xl shadow-lg relative"
                whileHover={{ y: -10, boxShadow: "0 25px 50px rgba(0,0,0,0.1)" }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <motion.div
                  className="absolute -top-4 -left-4 text-6xl text-pink-300 opacity-50"
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  "
                </motion.div>
                <div className="flex items-center gap-4 mb-6">
                  <motion.img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  />
                  <div>
                    <p className="font-bold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 italic leading-relaxed">{testimonial.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action with Animated Background */}
      <motion.section
        className="relative py-24 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ backgroundSize: '200% 200%' }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <motion.h2
            className="text-5xl font-bold mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={itemVariants}
          >
            Ready to Start Your Sweet Journey?
          </motion.h2>
          <motion.p
            className="text-xl mb-10"
            variants={itemVariants}
          >
            Join hundreds of students who've transformed their passion into profession
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            variants={itemVariants}
          >
            <motion.button
              onClick={() => setActiveTab('school')}
              className="bg-white text-purple-600 px-12 py-5 rounded-full font-bold text-lg shadow-2xl"
              whileHover={{ scale: 1.1, boxShadow: "0 20px 40px rgba(255,255,255,0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              Enroll Today
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('cakes')}
              className="bg-transparent border-2 border-white text-white px-12 py-5 rounded-full font-bold text-lg"
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Cakes
            </motion.button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}