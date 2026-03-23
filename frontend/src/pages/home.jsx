// // import React, { useState, useEffect } from 'react';
// // import { Link } from "react-router-dom";
// // import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
// // import {
// //   Menu,
// //   X,
// //   Users,
// //   Clock,
// //   DollarSign,
// //   CalendarCheck,
// //   TrendingUp,
// //   Shield,
// //   ArrowRight,
// //   Star,
// //   Github,
// //   Twitter,
// //   Linkedin,
// //   Instagram,
// //   ChevronRight,
// //   CheckCircle,
// //   Briefcase,
// //   Building2,
// //   Sparkles
// // } from 'lucide-react';

// // const HomePage = () => {
// //   const [isScrolled, setIsScrolled] = useState(false);
// //   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
// //   const { scrollYProgress } = useScroll();
// //   const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);
// //   const headerBlur = useTransform(scrollYProgress, [0, 0.1], [0, 8]);

// //   useEffect(() => {
// //     const handleScroll = () => {
// //       setIsScrolled(window.scrollY > 10);
// //     };
// //     window.addEventListener('scroll', handleScroll);
// //     return () => window.removeEventListener('scroll', handleScroll);
// //   }, []);

// // // const navLinks = [
// // //   { name: 'Home', path: '/' },
// // //   { name: 'Features', path: '/features' },
// // //   { name: 'About', path: '/about' },
// // //   { name: 'Contact', path: '/contact' }
// // // ];

// //   const features = [
// //     {
// //       icon: Users,
// //       title: 'Employee Management',
// //       description: 'Centralized directory with comprehensive employee profiles, documents, and role management.',
// //       color: 'from-blue-500 to-indigo-500'
// //     },
// //     {
// //       icon: Clock,
// //       title: 'Attendance Tracking',
// //       description: 'Real-time attendance monitoring with geofencing and biometric integration.',
// //       color: 'from-indigo-500 to-purple-500'
// //     },
// //     {
// //       icon: DollarSign,
// //       title: 'Payroll System',
// //       description: 'Automated payroll processing with tax calculations and direct deposit.',
// //       color: 'from-purple-500 to-pink-500'
// //     },
// //     {
// //       icon: CalendarCheck,
// //       title: 'Leave Management',
// //       description: 'Streamlined leave requests, approvals, and calendar integration.',
// //       color: 'from-pink-500 to-rose-500'
// //     },
// //     {
// //       icon: TrendingUp,
// //       title: 'Performance Analytics',
// //       description: 'Data-driven insights with customizable KPIs and performance reviews.',
// //       color: 'from-rose-500 to-orange-500'
// //     },
// //     {
// //       icon: Shield,
// //       title: 'Compliance & Security',
// //       description: 'Enterprise-grade security with role-based access and audit trails.',
// //       color: 'from-orange-500 to-amber-500'
// //     }
// //   ];

// //   const stats = [
// //     { value: '50K+', label: 'Employees Managed', icon: Briefcase },
// //     { value: '2.5K+', label: 'Companies Using', icon: Building2 },
// //     { value: '99.9%', label: 'Satisfaction Rate', icon: Star },
// //     { value: '24/7', label: 'Support Available', icon: Clock }
// //   ];

// //   const testimonials = [
// //     {
// //       name: 'Sarah Johnson',
// //       role: 'HR Director, TechCorp',
// //       content: 'This platform has transformed how we manage our workforce. The automation saves us 20+ hours weekly.',
// //       avatar: 'https://i.pravatar.cc/150?img=1',
// //       rating: 5
// //     },
// //     {
// //       name: 'Michael Chen',
// //       role: 'CEO, GrowthStartup',
// //       content: 'The most intuitive HRMS I have ever used. Our team adoption rate was over 90% in the first week.',
// //       avatar: 'https://i.pravatar.cc/150?img=2',
// //       rating: 5
// //     },
// //     {
// //       name: 'Emily Rodriguez',
// //       role: 'Operations Lead, ScaleFlow',
// //       content: 'The analytics and reporting capabilities are outstanding. It gives us insights we never had before.',
// //       avatar: 'https://i.pravatar.cc/150?img=3',
// //       rating: 5
// //     }
// //   ];

// //   const fadeInUp = {
// //     initial: { opacity: 0, y: 20 },
// //     animate: { opacity: 1, y: 0 },
// //     transition: { duration: 0.6 }
// //   };

// //   const staggerContainer = {
// //     animate: {
// //       transition: {
// //         staggerChildren: 0.1
// //       }
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-white dark:bg-slate-950">


// //       {/* Hero Section */}
// //       <section id="home" className="relative pt-24 lg:pt-32 overflow-hidden">
// //         {/* Background Gradient */}
// //         <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />
// // <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

// //         <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
// //           <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
// //             {/* Left Column - Text */}
// //             <motion.div
// //               initial={{ opacity: 0, y: 30 }}
// //               animate={{ opacity: 1, y: 0 }}
// //               transition={{ duration: 0.8 }}
// //             >
// //               <motion.div
// //                 initial={{ opacity: 0, x: -20 }}
// //                 animate={{ opacity: 1, x: 0 }}
// //                 transition={{ delay: 0.2 }}
// //                 className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full px-4 py-2 mb-6"
// //               >
// //                 <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
// //                 <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
// //                   Trusted by 2,500+ companies
// //                 </span>
// //               </motion.div>

// //               <motion.h1
// //                 initial={{ opacity: 0, y: 20 }}
// //                 animate={{ opacity: 1, y: 0 }}
// //                 transition={{ delay: 0.3 }}
// //                 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
// //               >
// //                 <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
// //                   Manage Your
// //                 </span>
// //                 <br />
// //                 <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
// //                   Workforce Smarter
// //                 </span>
// //               </motion.h1>

// //               <motion.p
// //                 initial={{ opacity: 0, y: 20 }}
// //                 animate={{ opacity: 1, y: 0 }}
// //                 transition={{ delay: 0.4 }}
// //                 className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-2xl"
// //               >
// //                 Streamline your HR operations with our all-in-one platform. From onboarding to payroll, manage everything with ease.
// //               </motion.p>

// //               <motion.div
// //                 initial={{ opacity: 0, y: 20 }}
// //                 animate={{ opacity: 1, y: 0 }}
// //                 transition={{ delay: 0.5 }}
// //                 className="mt-8 flex flex-col sm:flex-row gap-4"
// //               >
// //                 <button className="group px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105">
// //                   Get Started
// //                   <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
// //                 </button>
// //                 <button className="px-8 py-4 text-base font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
// //                   Learn More
// //                 </button>
// //               </motion.div>

// //               {/* Trust Indicators */}
// //               <motion.div
// //                 initial={{ opacity: 0 }}
// //                 animate={{ opacity: 1 }}
// //                 transition={{ delay: 0.6 }}
// //                 className="mt-12 flex items-center space-x-6"
// //               >
// //                 <div className="flex -space-x-2">
// //                   {[1, 2, 3, 4].map((i) => (
// //                     <img
// //                       key={i}
// //                       src={`https://i.pravatar.cc/40?img=${i}`}
// //                       alt="User"
// //                       className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800"
// //                     />
// //                   ))}
// //                 </div>
// //                 <div className="flex items-center">
// //                   {[1, 2, 3, 4, 5].map((i) => (
// //                     <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
// //                   ))}
// //                 </div>
// //                 <span className="text-sm text-slate-600 dark:text-slate-400">
// //                   From 2,500+ reviews
// //                 </span>
// //               </motion.div>
// //             </motion.div>

// //             {/* Right Column - Image/Illustration */}
// //             <motion.div
// //               initial={{ opacity: 0, scale: 0.9 }}
// //               animate={{ opacity: 1, scale: 1 }}
// //               transition={{ delay: 0.4, duration: 0.8 }}
// //               className="relative"
// //             >
// //               <div className="relative rounded-2xl overflow-hidden shadow-2xl">
// //                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 mix-blend-overlay" />
// //                 <img
// //                   src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
// //                   alt="Dashboard Preview"
// //                   className="w-full h-auto"
// //                 />
                
// //                 {/* Floating Stats */}
// //                 <motion.div
// //                   initial={{ opacity: 0, x: -20 }}
// //                   animate={{ opacity: 1, x: 0 }}
// //                   transition={{ delay: 0.8 }}
// //                   className="absolute top-8 left-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg rounded-lg p-3 shadow-xl"
// //                 >
// //                   <div className="flex items-center space-x-2">
// //                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
// //                     <span className="text-sm font-medium">Live Demo Available</span>
// //                   </div>
// //                 </motion.div>

// //                 <motion.div
// //                   initial={{ opacity: 0, x: 20 }}
// //                   animate={{ opacity: 1, x: 0 }}
// //                   transition={{ delay: 1 }}
// //                   className="absolute bottom-8 right-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg rounded-lg p-3 shadow-xl"
// //                 >
// //                   <div className="flex items-center space-x-3">
// //                     <CheckCircle className="w-5 h-5 text-green-500" />
// //                     <span className="text-sm font-medium">99.9% Uptime</span>
// //                   </div>
// //                 </motion.div>
// //               </div>
// //             </motion.div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Stats Section */}
// //       <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
// //         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
// //           <motion.div
// //             variants={staggerContainer}
// //             initial="initial"
// //             whileInView="animate"
// //             viewport={{ once: true }}
// //             className="grid grid-cols-2 lg:grid-cols-4 gap-8"
// //           >
// //             {stats.map((stat, index) => (
// //               <motion.div
// //                 key={stat.label}
// //                 variants={fadeInUp}
// //                 className="text-center"
// //               >
// //                 <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl mb-4">
// //                   <stat.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
// //                 </div>
// //                 <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
// //                   {stat.value}
// //                 </div>
// //                 <div className="text-sm text-slate-600 dark:text-slate-400">
// //                   {stat.label}
// //                 </div>
// //               </motion.div>
// //             ))}
// //           </motion.div>
// //         </div>
// //       </section>

// //       {/* Features Section */}
// //       <section id="features" className="py-20">
// //         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
// //           <motion.div
// //             initial={{ opacity: 0, y: 20 }}
// //             whileInView={{ opacity: 1, y: 0 }}
// //             viewport={{ once: true }}
// //             className="text-center max-w-3xl mx-auto mb-16"
// //           >
// //             <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
// //               Everything you need to manage your team
// //             </h2>
// //             <p className="text-xl text-slate-600 dark:text-slate-400">
// //               Comprehensive features designed to streamline your HR operations and boost productivity.
// //             </p>
// //           </motion.div>

// //           <motion.div
// //             variants={staggerContainer}
// //             initial="initial"
// //             whileInView="animate"
// //             viewport={{ once: true }}
// //             className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
// //           >
// //             {features.map((feature, index) => (
// //               <motion.div
// //                 key={feature.title}
// //                 variants={fadeInUp}
// //                 whileHover={{ y: -8 }}
// //                 className="group relative bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
// //               >
// //                 <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
// //                 <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-6 shadow-lg`}>
// //                   <feature.icon className="w-7 h-7 text-white" />
// //                 </div>
// //                 <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
// //                   {feature.title}
// //                 </h3>
// //                 <p className="text-slate-600 dark:text-slate-400 mb-4">
// //                   {feature.description}
// //                 </p>
// //                 <a
// //                   href="#"
// //                   className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:gap-2 transition-all"
// //                 >
// //                   Learn more
// //                   <ChevronRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
// //                 </a>
// //               </motion.div>
// //             ))}
// //           </motion.div>
// //         </div>
// //       </section>

// //       {/* Testimonials Section */}
// //       <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
// //         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
// //           <motion.div
// //             initial={{ opacity: 0, y: 20 }}
// //             whileInView={{ opacity: 1, y: 0 }}
// //             viewport={{ once: true }}
// //             className="text-center max-w-3xl mx-auto mb-16"
// //           >
// //             <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
// //               Trusted by HR professionals worldwide
// //             </h2>
// //             <p className="text-xl text-slate-600 dark:text-slate-400">
// //               See what our customers say about their experience.
// //             </p>
// //           </motion.div>

// //           <motion.div
// //             variants={staggerContainer}
// //             initial="initial"
// //             whileInView="animate"
// //             viewport={{ once: true }}
// //             className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
// //           >
// //             {testimonials.map((testimonial, index) => (
// //               <motion.div
// //                 key={testimonial.name}
// //                 variants={fadeInUp}
// //                 className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-800"
// //               >
// //                 <div className="flex items-center space-x-1 mb-4">
// //                   {[...Array(testimonial.rating)].map((_, i) => (
// //                     <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
// //                   ))}
// //                 </div>
// //                 <p className="text-slate-700 dark:text-slate-300 mb-6">
// //                   "{testimonial.content}"
// //                 </p>
// //                 <div className="flex items-center space-x-4">
// //                   <img
// //                     src={testimonial.avatar}
// //                     alt={testimonial.name}
// //                     className="w-12 h-12 rounded-full"
// //                   />
// //                   <div>
// //                     <h4 className="font-semibold text-slate-900 dark:text-white">
// //                       {testimonial.name}
// //                     </h4>
// //                     <p className="text-sm text-slate-600 dark:text-slate-400">
// //                       {testimonial.role}
// //                     </p>
// //                   </div>
// //                 </div>
// //               </motion.div>
// //             ))}
// //           </motion.div>
// //         </div>
// //       </section>

// //       {/* CTA Section */}
// //       <section className="py-20">
// //         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
// //           <motion.div
// //             initial={{ opacity: 0, scale: 0.95 }}
// //             whileInView={{ opacity: 1, scale: 1 }}
// //             viewport={{ once: true }}
// //             className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl overflow-hidden"
// //           >
// //             <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23FFFFFF%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
// //             <div className="relative py-16 px-8 text-center">
// //               <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
// //                 Start managing your team today
// //               </h2>
// //               <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
// //                 Join thousands of companies already using our platform to streamline their HR operations.
// //               </p>
// //              <Link to="/register">
// //   <button className="group px-8 py-4 text-base font-medium text-indigo-600 bg-white rounded-full hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105">
// //     Sign Up Now
// //     <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
// //   </button>
// // </Link>
// //             </div>
// //           </motion.div>
// //         </div>
// //       </section>

// //       {/* Footer */}

// //     </div>

// //   );

// // };

// // export default HomePage;

// import React, { useState, useEffect } from 'react';
// import { Link } from "react-router-dom";
// import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
// import {
//   Menu,
//   X,
//   Users,
//   Clock,
//   DollarSign,
//   CalendarCheck,
//   TrendingUp,
//   Shield,
//   ArrowRight,
//   Star,
//   Github,
//   Twitter,
//   Linkedin,
//   Instagram,
//   ChevronRight,
//   CheckCircle,
//   Briefcase,
//   Building2,
//   Sparkles
// } from 'lucide-react';

// const HomePage = () => {
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const { scrollYProgress } = useScroll();
//   const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);
//   const headerBlur = useTransform(scrollYProgress, [0, 0.1], [0, 8]);

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 10);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   const features = [
//     {
//       icon: Users,
//       title: 'Employee Management',
//       description: 'Centralized directory with comprehensive employee profiles, documents, and role management.',
//       color: 'from-blue-500 to-indigo-500'
//     },
//     {
//       icon: Clock,
//       title: 'Attendance Tracking',
//       description: 'Real-time attendance monitoring with geofencing and biometric integration.',
//       color: 'from-indigo-500 to-purple-500'
//     },
//     {
//       icon: DollarSign,
//       title: 'Payroll System',
//       description: 'Automated payroll processing with tax calculations and direct deposit.',
//       color: 'from-purple-500 to-pink-500'
//     },
//     {
//       icon: CalendarCheck,
//       title: 'Leave Management',
//       description: 'Streamlined leave requests, approvals, and calendar integration.',
//       color: 'from-pink-500 to-rose-500'
//     },
//     {
//       icon: TrendingUp,
//       title: 'Performance Analytics',
//       description: 'Data-driven insights with customizable KPIs and performance reviews.',
//       color: 'from-rose-500 to-orange-500'
//     },
//     {
//       icon: Shield,
//       title: 'Compliance & Security',
//       description: 'Enterprise-grade security with role-based access and audit trails.',
//       color: 'from-orange-500 to-amber-500'
//     }
//   ];

//   const stats = [
//     { value: '50K+', label: 'Employees Managed', icon: Briefcase },
//     { value: '2.5K+', label: 'Companies Using', icon: Building2 },
//     { value: '99.9%', label: 'Satisfaction Rate', icon: Star },
//     { value: '24/7', label: 'Support Available', icon: Clock }
//   ];

//   const testimonials = [
//     {
//       name: 'Sarah Johnson',
//       role: 'HR Director, TechCorp',
//       content: 'This platform has transformed how we manage our workforce. The automation saves us 20+ hours weekly.',
//       avatar: 'https://i.pravatar.cc/150?img=1',
//       rating: 5
//     },
//     {
//       name: 'Michael Chen',
//       role: 'CEO, GrowthStartup',
//       content: 'The most intuitive HRMS I have ever used. Our team adoption rate was over 90% in the first week.',
//       avatar: 'https://i.pravatar.cc/150?img=2',
//       rating: 5
//     },
//     {
//       name: 'Emily Rodriguez',
//       role: 'Operations Lead, ScaleFlow',
//       content: 'The analytics and reporting capabilities are outstanding. It gives us insights we never had before.',
//       avatar: 'https://i.pravatar.cc/150?img=3',
//       rating: 5
//     }
//   ];

//   const fadeInUp = {
//     initial: { opacity: 0, y: 20 },
//     animate: { opacity: 1, y: 0 },
//     transition: { duration: 0.6 }
//   };

//   const staggerContainer = {
//     animate: {
//       transition: {
//         staggerChildren: 0.1
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white dark:bg-slate-950">
//       {/* Hero Section */}
//       <section id="home" className="relative pt-24 lg:pt-32 overflow-hidden">
//         {/* Background Gradient */}
//         <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />
//         <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
//           <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
//             {/* Left Column - Text */}
//             <motion.div
//               initial={{ opacity: 0, y: 30 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8 }}
//             >
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.2 }}
//                 className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full px-4 py-2 mb-6"
//               >
//                 <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
//                 <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
//                   Trusted by 2,500+ companies
//                 </span>
//               </motion.div>

//               <motion.h1
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.3 }}
//                 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
//               >
//                 <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
//                   Manage Your
//                 </span>
//                 <br />
//                 <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
//                   Workforce Smarter
//                 </span>
//               </motion.h1>

//               <motion.p
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.4 }}
//                 className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-2xl"
//               >
//                 Streamline your HR operations with our all-in-one platform. From onboarding to payroll, manage everything with ease.
//               </motion.p>

//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.5 }}
//                 className="mt-8 flex flex-col sm:flex-row gap-4"
//               >
//                 <Link to="/register">
//                   <button className="group px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105">
//                     Get Started
//                     <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                   </button>
//                 </Link>
//                 <Link to="/features">
//                   <button className="px-8 py-4 text-base font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
//                     Learn More
//                   </button>
//                 </Link>
//               </motion.div>

//               {/* Trust Indicators */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.6 }}
//                 className="mt-12 flex items-center space-x-6"
//               >
//                 <div className="flex -space-x-2">
//                   {[1, 2, 3, 4].map((i) => (
//                     <img
//                       key={i}
//                       src={`https://i.pravatar.cc/40?img=${i}`}
//                       alt="User"
//                       className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800"
//                     />
//                   ))}
//                 </div>
//                 <div className="flex items-center">
//                   {[1, 2, 3, 4, 5].map((i) => (
//                     <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
//                   ))}
//                 </div>
//                 <span className="text-sm text-slate-600 dark:text-slate-400">
//                   From 2,500+ reviews
//                 </span>
//               </motion.div>
//             </motion.div>

//             {/* Right Column - Image/Illustration */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.4, duration: 0.8 }}
//               className="relative"
//             >
//               <div className="relative rounded-2xl overflow-hidden shadow-2xl">
//                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 mix-blend-overlay" />
//                 <img
//                   src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
//                   alt="Dashboard Preview"
//                   className="w-full h-auto"
//                 />
                
//                 {/* Floating Stats */}
//                 <motion.div
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: 0.8 }}
//                   className="absolute top-8 left-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg rounded-lg p-3 shadow-xl"
//                 >
//                   <div className="flex items-center space-x-2">
//                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//                     <span className="text-sm font-medium">Live Demo Available</span>
//                   </div>
//                 </motion.div>

//                 <motion.div
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: 1 }}
//                   className="absolute bottom-8 right-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg rounded-lg p-3 shadow-xl"
//                 >
//                   <div className="flex items-center space-x-3">
//                     <CheckCircle className="w-5 h-5 text-green-500" />
//                     <span className="text-sm font-medium">99.9% Uptime</span>
//                   </div>
//                 </motion.div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div
//             variants={staggerContainer}
//             initial="initial"
//             whileInView="animate"
//             viewport={{ once: true }}
//             className="grid grid-cols-2 lg:grid-cols-4 gap-8"
//           >
//             {stats.map((stat, index) => (
//               <motion.div
//                 key={stat.label}
//                 variants={fadeInUp}
//                 className="text-center"
//               >
//                 <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl mb-4">
//                   <stat.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
//                 </div>
//                 <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
//                   {stat.value}
//                 </div>
//                 <div className="text-sm text-slate-600 dark:text-slate-400">
//                   {stat.label}
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-20">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-center max-w-3xl mx-auto mb-16"
//           >
//             <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
//               Everything you need to manage your team
//             </h2>
//             <p className="text-xl text-slate-600 dark:text-slate-400">
//               Comprehensive features designed to streamline your HR operations and boost productivity.
//             </p>
//           </motion.div>

//           <motion.div
//             variants={staggerContainer}
//             initial="initial"
//             whileInView="animate"
//             viewport={{ once: true }}
//             className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
//           >
//             {features.map((feature, index) => (
//               <motion.div
//                 key={feature.title}
//                 variants={fadeInUp}
//                 whileHover={{ y: -8 }}
//                 className="group relative bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
//               >
//                 <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
//                 <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-6 shadow-lg`}>
//                   <feature.icon className="w-7 h-7 text-white" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
//                   {feature.title}
//                 </h3>
//                 <p className="text-slate-600 dark:text-slate-400 mb-4">
//                   {feature.description}
//                 </p>
//                 <Link
//                   to="/features"
//                   className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:gap-2 transition-all"
//                 >
//                   Learn more
//                   <ChevronRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
//                 </Link>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="text-center max-w-3xl mx-auto mb-16"
//           >
//             <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
//               Trusted by HR professionals worldwide
//             </h2>
//             <p className="text-xl text-slate-600 dark:text-slate-400">
//               See what our customers say about their experience.
//             </p>
//           </motion.div>

//           <motion.div
//             variants={staggerContainer}
//             initial="initial"
//             whileInView="animate"
//             viewport={{ once: true }}
//             className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
//           >
//             {testimonials.map((testimonial, index) => (
//               <motion.div
//                 key={testimonial.name}
//                 variants={fadeInUp}
//                 className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-800"
//               >
//                 <div className="flex items-center space-x-1 mb-4">
//                   {[...Array(testimonial.rating)].map((_, i) => (
//                     <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
//                   ))}
//                 </div>
//                 <p className="text-slate-700 dark:text-slate-300 mb-6">
//                   "{testimonial.content}"
//                 </p>
//                 <div className="flex items-center space-x-4">
//                   <img
//                     src={testimonial.avatar}
//                     alt={testimonial.name}
//                     className="w-12 h-12 rounded-full"
//                   />
//                   <div>
//                     <h4 className="font-semibold text-slate-900 dark:text-white">
//                       {testimonial.name}
//                     </h4>
//                     <p className="text-sm text-slate-600 dark:text-slate-400">
//                       {testimonial.role}
//                     </p>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             viewport={{ once: true }}
//             className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl overflow-hidden"
//           >
//             <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23FFFFFF%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
//             <div className="relative py-16 px-8 text-center">
//               <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
//                 Start managing your team today
//               </h2>
//               <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
//                 Join thousands of companies already using our platform to streamline their HR operations.
//               </p>
//               <Link to="/register">
//                 <button className="group px-8 py-4 text-base font-medium text-indigo-600 bg-white rounded-full hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105">
//                   Sign Up Now
//                   <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                 </button>
//               </Link>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Footer - Completely removed */}
//     </div>
//   );
// };

// export default HomePage;


import React from 'react';
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  DollarSign,
  CalendarCheck,
  TrendingUp,
  Shield,
  ArrowRight,
  Star,
  ChevronRight,
  CheckCircle,
  Briefcase,
  Building2,
  Sparkles
} from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Centralized directory with comprehensive employee profiles, documents, and role management.',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Real-time attendance monitoring with geofencing and biometric integration.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: DollarSign,
      title: 'Payroll System',
      description: 'Automated payroll processing with tax calculations and direct deposit.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: CalendarCheck,
      title: 'Leave Management',
      description: 'Streamlined leave requests, approvals, and calendar integration.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: TrendingUp,
      title: 'Performance Analytics',
      description: 'Data-driven insights with customizable KPIs and performance reviews.',
      color: 'from-rose-500 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Compliance & Security',
      description: 'Enterprise-grade security with role-based access and audit trails.',
      color: 'from-orange-500 to-amber-500'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Employees Managed', icon: Briefcase },
    { value: '2.5K+', label: 'Companies Using', icon: Building2 },
    { value: '99.9%', label: 'Satisfaction Rate', icon: Star },
    { value: '24/7', label: 'Support Available', icon: Clock }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'HR Director, TechCorp',
      content: 'This platform has transformed how we manage our workforce. The automation saves us 20+ hours weekly.',
      avatar: 'https://i.pravatar.cc/150?img=1',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'CEO, GrowthStartup',
      content: 'The most intuitive HRMS I have ever used. Our team adoption rate was over 90% in the first week.',
      avatar: 'https://i.pravatar.cc/150?img=2',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Operations Lead, ScaleFlow',
      content: 'The analytics and reporting capabilities are outstanding. It gives us insights we never had before.',
      avatar: 'https://i.pravatar.cc/150?img=3',
      rating: 5
    }
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section - No header, just starts with content */}
      <section id="home" className="relative pt-24 lg:pt-32 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Column - Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full px-4 py-2 mb-6"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  Trusted by 2,500+ companies
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
              >
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Manage Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Workforce Smarter
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-2xl"
              >
                Streamline your HR operations with our all-in-one platform. From onboarding to payroll, manage everything with ease.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex flex-col sm:flex-row gap-4"
              >
                <Link to="/register">
                  <button className="group px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105">
                    Get Started
                    <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link to="/features">
                  <button className="px-8 py-4 text-base font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300">
                    Learn More
                  </button>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 flex items-center space-x-6"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/40?img=${i}`}
                      alt="User"
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800"
                    />
                  ))}
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  From 2,500+ reviews
                </span>
              </motion.div>
            </motion.div>

            {/* Right Column - Image/Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 mix-blend-overlay" />
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
                  alt="Dashboard Preview"
                  className="w-full h-auto"
                />
                
                {/* Floating Stats */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute top-8 left-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg rounded-lg p-3 shadow-xl"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Live Demo Available</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute bottom-8 right-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg rounded-lg p-3 shadow-xl"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">99.9% Uptime</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl mb-4">
                  <stat.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to manage your team
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Comprehensive features designed to streamline your HR operations and boost productivity.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-6 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {feature.description}
                </p>
                <Link
                  to="/features"
                  className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:gap-2 transition-all"
                >
                  Learn more
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Trusted by HR professionals worldwide
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              See what our customers say about their experience.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={fadeInUp}
                className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-6">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23FFFFFF%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
            <div className="relative py-16 px-8 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Start managing your team today
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join thousands of companies already using our platform to streamline their HR operations.
              </p>
              <Link to="/register">
                <button className="group px-8 py-4 text-base font-medium text-indigo-600 bg-white rounded-full hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105">
                  Sign Up Now
                  <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;