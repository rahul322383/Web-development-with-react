import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Target,
  Users,
  Award,
  Globe,
  Rocket,
  CheckCircle,
  ArrowRight,
  Linkedin,
  Twitter,
  Mail,
  Sparkles,
  Building2,
  Briefcase,
  Zap,
  Shield,
  Clock,
  Star
} from 'lucide-react';

const About = () => {
  const stats = [
    { value: '2018', label: 'Founded', icon: Clock },
    { value: '50+', label: 'Team Members', icon: Users },
    { value: '2.5K+', label: 'Companies', icon: Building2 },
    { value: '98%', label: 'Retention Rate', icon: Star }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We put our customers at the heart of everything we do, ensuring their success is our success.',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'Constantly pushing boundaries to deliver cutting-edge HR solutions that make a difference.',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Users,
      title: 'Inclusivity',
      description: 'Building a diverse and inclusive workplace where everyone feels valued and heard.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Striving for excellence in every aspect of our product and customer experience.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'Empowering teams worldwide to build better workplaces and stronger communities.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Rocket,
      title: 'Growth Mindset',
      description: 'Embracing challenges and learning opportunities to grow together as a team.',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  const team = [
    {
      name: 'Sarah Mitchell',
      role: 'CEO & Co-Founder',
      bio: 'Former HR Tech leader with 15+ years of experience in transforming workplace management.',
      image: 'https://i.pravatar.cc/400?img=1',
      social: {
        linkedin: '#',
        twitter: '#',
        email: '#'
      }
    },
    {
      name: 'David Chen',
      role: 'CTO & Co-Founder',
      bio: 'Tech visionary with expertise in building scalable HR solutions for enterprise clients.',
      image: 'https://i.pravatar.cc/400?img=2',
      social: {
        linkedin: '#',
        twitter: '#',
        email: '#'
      }
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      bio: 'Passionate about creating intuitive experiences that simplify complex HR processes.',
      image: 'https://i.pravatar.cc/400?img=3',
      social: {
        linkedin: '#',
        twitter: '#',
        email: '#'
      }
    },
    {
      name: 'Michael Okonkwo',
      role: 'Engineering Lead',
      bio: 'Leading technical innovation and ensuring our platform remains reliable and secure.',
      image: 'https://i.pravatar.cc/400?img=4',
      social: {
        linkedin: '#',
        twitter: '#',
        email: '#'
      }
    }
  ];

  const milestones = [
    {
      year: '2018',
      title: 'The Beginning',
      description: 'Founded with a mission to modernize HR management for growing teams.',
      icon: Rocket
    },
    {
      year: '2019',
      title: 'First 100 Customers',
      description: 'Reached 100 companies trusting our platform for their HR needs.',
      icon: Users
    },
    {
      year: '2020',
      title: 'Remote Work Revolution',
      description: 'Launched remote workforce management features to support distributed teams.',
      icon: Globe
    },
    {
      year: '2021',
      title: 'Series A Funding',
      description: 'Raised $20M to accelerate product development and expand our team.',
      icon: Award
    },
    {
      year: '2022',
      title: 'Global Expansion',
      description: 'Opened offices in Europe and Asia to serve international clients better.',
      icon: Building2
    },
    {
      year: '2023',
      title: 'AI-Powered Insights',
      description: 'Introduced AI-driven analytics to help companies make data-backed decisions.',
      icon: Zap
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
      {/* Hero Section */}
      <section className="relative pt-24 lg:pt-32 pb-20 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full px-4 py-2 mb-6"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                Our Story
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                We're on a mission to
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                transform HR management
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
            >
              Founded in 2018, we've grown from a small startup to a trusted partner for thousands of companies worldwide. Our journey is driven by a simple belief: great HR tools should be accessible to everyone.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
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
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl mb-4">
                  <stat.icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
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

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Building the future of work, together
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                  What started as a simple idea in a coffee shop has evolved into a comprehensive HR platform trusted by over 2,500 companies worldwide. Our founders, Sarah and David, recognized the need for modern, intuitive HR tools that could adapt to the changing nature of work.
                </p>
                <p>
                  Today, we're a diverse team of 50+ passionate individuals spread across the globe, all working towards a common goal: making HR management effortless and empowering for everyone.
                </p>
                <p>
                  We believe that great companies are built by great people, and we're here to help you nurture and grow your most valuable asset – your team.
                </p>
              </div>

              <div className="mt-8 flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/40?img=${i}`}
                      alt="Team member"
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800"
                    />
                  ))}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">50+</span> team members worldwide
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
                  alt="Our team"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 mix-blend-overlay" />
              </div>
              
              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 rounded-lg p-4 shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">98% Customer</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Satisfaction Rate</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              The principles that guide everything we do, from product development to customer support.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${value.color} rounded-xl mb-6 shadow-lg`}>
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Milestones Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Key milestones that have shaped our path to becoming a leader in HR technology.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-indigo-500 to-purple-500 hidden lg:block" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`relative flex flex-col lg:flex-row ${
                    index % 2 === 0 ? 'lg:flex-row-reverse' : ''
                  } items-center gap-8`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-indigo-600 rounded-full border-4 border-white dark:border-slate-900 hidden lg:block" />

                  {/* Content */}
                  <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:text-right' : ''}`}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-800">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl mb-4">
                        <milestone.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  {/* Empty space for alignment */}
                  <div className="hidden lg:block lg:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Meet Our Leadership
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Passionate experts dedicated to revolutionizing HR management.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className="relative mb-4 rounded-2xl overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Social Links */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href={member.social.linkedin} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-indigo-50 transition-colors">
                      <Linkedin className="w-4 h-4 text-indigo-600" />
                    </a>
                    <a href={member.social.twitter} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-indigo-50 transition-colors">
                      <Twitter className="w-4 h-4 text-indigo-600" />
                    </a>
                    <a href={member.social.email} className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-indigo-50 transition-colors">
                      <Mail className="w-4 h-4 text-indigo-600" />
                    </a>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-2">
                  {member.role}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <button className="group px-8 py-4 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105">
              Join Our Team
              <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
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
                Join us in shaping the future of work
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Ready to transform your HR processes? Let's make it happen together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group px-8 py-4 text-base font-medium text-indigo-600 bg-white rounded-full hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105">
                  Get Started Today
                  <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 text-base font-medium text-white border border-white/30 rounded-full hover:bg-white/10 transition-all duration-300">
                  Contact Sales
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;