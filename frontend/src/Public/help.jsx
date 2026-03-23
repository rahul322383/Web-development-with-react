import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Phone,
  Mail,
  ChevronRight,
  ChevronDown,
  FileText,
  Video,
  Users,
  Shield,
  Clock,
  Zap,
  Globe,
  Award,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Headphones,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Copy,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Download,
  Star,
  Twitter,
  Github,
  Linkedin,
  Youtube
} from 'lucide-react';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const [copied, setCopied] = useState(false);

  const categories = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'New to HRMS? Start here to learn the basics.',
      color: 'from-blue-500 to-indigo-500',
      articles: 12
    },
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Manage employees, roles, and permissions.',
      color: 'from-indigo-500 to-purple-500',
      articles: 8
    },
    {
      icon: Clock,
      title: 'Attendance & Leave',
      description: 'Track attendance and manage leave requests.',
      color: 'from-purple-500 to-pink-500',
      articles: 10
    },
    {
      icon: Shield,
      title: 'Payroll & Benefits',
      description: 'Process payroll and manage employee benefits.',
      color: 'from-pink-500 to-rose-500',
      articles: 15
    },
    {
      icon: Zap,
      title: 'Performance Reviews',
      description: 'Conduct reviews and track employee performance.',
      color: 'from-rose-500 to-orange-500',
      articles: 7
    },
    {
      icon: Globe,
      title: 'Integrations',
      description: 'Connect with your favorite tools and services.',
      color: 'from-orange-500 to-amber-500',
      articles: 9
    }
  ];

  const popularArticles = [
    {
      title: 'How to add a new employee',
      views: 2345,
      helpful: 98,
      icon: Users
    },
    {
      title: 'Setting up payroll for the first time',
      views: 1890,
      helpful: 95,
      icon: FileText
    },
    {
      title: 'Managing leave requests and approvals',
      views: 1567,
      helpful: 97,
      icon: Clock
    },
    {
      title: 'Understanding role-based permissions',
      views: 1234,
      helpful: 96,
      icon: Shield
    },
    {
      title: 'Generating performance reports',
      views: 1123,
      helpful: 94,
      icon: Zap
    },
    {
      title: 'Integrating with Slack and Teams',
      views: 987,
      helpful: 99,
      icon: Globe
    }
  ];

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to the login page and click "Forgot Password". You\'ll receive an email with instructions to reset your password. If you don\'t receive the email within 5 minutes, check your spam folder or contact support.',
      category: 'Account'
    },
    {
      question: 'How do I add multiple employees at once?',
      answer: 'Navigate to Employees > Bulk Import. You can download the CSV template, fill in your employee data, and upload it back. The system will validate the data and show any errors before processing.',
      category: 'Employees'
    },
    {
      question: 'How is payroll calculated?',
      answer: 'Payroll is calculated based on base salary, attendance, overtime, deductions, and taxes. You can configure all these settings in Payroll > Settings. The system automatically calculates net pay for each employee.',
      category: 'Payroll'
    },
    {
      question: 'Can employees request leave through mobile?',
      answer: 'Yes! Our mobile app (available on iOS and Android) allows employees to request leave, view their balance, and track approval status on the go.',
      category: 'Leave'
    },
    {
      question: 'How do I set up performance review cycles?',
      answer: 'Go to Performance > Review Cycles and click "Create New Cycle". Set the review period, choose participants, and configure the review form. You can schedule automatic reminders and notifications.',
      category: 'Performance'
    },
    {
      question: 'What integrations are available?',
      answer: 'We integrate with Slack, Microsoft Teams, Google Workspace, QuickBooks, Xero, Zapier, and many more. Visit our Integrations page to see the full list and setup guides.',
      category: 'Integrations'
    }
  ];

  const tutorials = [
    {
      title: 'Complete HRMS Walkthrough',
      duration: '15:30',
      views: '12K',
      level: 'Beginner',
      icon: PlayCircle
    },
    {
      title: 'Setting Up Your Company Profile',
      duration: '8:45',
      views: '8.5K',
      level: 'Beginner',
      icon: PlayCircle
    },
    {
      title: 'Advanced Payroll Configuration',
      duration: '22:15',
      views: '5.2K',
      level: 'Advanced',
      icon: PlayCircle
    },
    {
      title: 'Performance Review Best Practices',
      duration: '18:20',
      views: '6.7K',
      level: 'Intermediate',
      icon: PlayCircle
    }
  ];

  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      availability: '24/7',
      action: 'Start Chat',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak with a specialist',
      availability: 'Mon-Fri, 9AM-6PM',
      action: 'Call Now',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      availability: '24-48h response',
      action: 'Send Email',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <Headphones className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                Help Center
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                How can we
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                help you today?
              </span>
            </motion.h1>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl mx-auto mt-8"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search for answers, tutorials, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                  />
                  <button className="absolute right-3 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                    Search
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Help Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Find the help you need, organized by topic
            </p>
          </motion.div>

          <motion.div
            variants={{
              animate: { transition: { staggerChildren: 0.1 } }
            }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl mb-6 shadow-lg`}>
                  <category.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {category.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-500">
                    {category.articles} articles
                  </span>
                  <ChevronRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Most Popular Articles
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              What other HR professionals are reading
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {popularArticles.map((article, index) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white dark:bg-slate-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <article.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500 dark:text-slate-500">
                        {article.views.toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <ThumbsUp className="w-4 h-4" />
                        {article.helpful}% helpful
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Quick answers to common questions
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="mb-4"
              >
                <div
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1 block">
                        {faq.category}
                      </span>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {faq.question}
                      </h3>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`} />
                  </div>
                  
                  <AnimatePresence>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-200 dark:border-slate-800"
                      >
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50">
                          <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {faq.answer}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-500 dark:text-slate-500">
                                Was this helpful?
                              </span>
                              <button
                                onClick={() => setFeedbackGiven({ ...feedbackGiven, [index]: 'yes' })}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  feedbackGiven[index] === 'yes'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                    : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400'
                                }`}
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setFeedbackGiven({ ...feedbackGiven, [index]: 'no' })}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  feedbackGiven[index] === 'no'
                                    ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                                    : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400'
                                }`}
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleCopy(faq.answer)}
                              className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                            >
                              {copied ? (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  Copy answer
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Video Tutorials
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Learn visually with our step-by-step guides
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tutorials.map((tutorial, index) => (
              <motion.div
                key={tutorial.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative aspect-video bg-gradient-to-br from-indigo-600 to-purple-600">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-white">
                    {tutorial.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {tutorial.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-500">
                      {tutorial.views} views
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      tutorial.level === 'Beginner'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : tutorial.level === 'Intermediate'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {tutorial.level}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <button className="group px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105">
              View All Tutorials
              <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Still Need Help?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Choose your preferred way to get support
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {supportOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${option.color} rounded-xl mb-6 shadow-lg`}>
                  <option.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {option.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {option.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500 mb-4">
                  <Clock className="w-4 h-4" />
                  {option.availability}
                </div>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:scale-[1.02]">
                  {option.action}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community & Resources */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Community Forum */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Community Forum
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Join discussions with other HR professionals
                  </p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Best practices for remote onboarding</p>
                    <p className="text-sm text-slate-500">24 replies · 3 hours ago</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Payroll calculation questions</p>
                    <p className="text-sm text-slate-500">18 replies · 5 hours ago</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Performance review templates</p>
                    <p className="text-sm text-slate-500">32 replies · yesterday</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
              <button className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:border-indigo-600 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Join the Community
              </button>
            </motion.div>

            {/* Resources */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Resources & Downloads
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Templates, guides, and tools
                  </p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">HR Policy Template</p>
                      <p className="text-sm text-slate-500">PDF, 245 KB</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Employee Handbook</p>
                      <p className="text-sm text-slate-500">DOCX, 1.2 MB</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Performance Review Form</p>
                      <p className="text-sm text-slate-500">XLSX, 356 KB</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
              <button className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:border-indigo-600 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Browse All Resources
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact & Social */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl overflow-hidden"
          >
<div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23FFFFFF%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
            
            <div className="relative py-12 px-8 text-center">
              <Sparkles className="w-12 h-12 text-white/50 mx-auto mb-4" />
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Can't find what you're looking for?
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Our support team is ready to help you with any questions or issues.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button className="px-8 py-4 bg-white text-indigo-600 rounded-full font-medium hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  Contact Support
                </button>
                <button className="px-8 py-4 bg-indigo-500/20 text-white border border-indigo-300/30 rounded-full font-medium hover:bg-indigo-500/30 transition-all duration-300">
                  Schedule a Demo
                </button>
              </div>

              <div className="flex items-center justify-center gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Twitter className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Github className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Youtube className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Help;