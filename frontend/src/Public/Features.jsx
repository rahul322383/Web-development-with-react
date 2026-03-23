import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  DollarSign,
  CalendarCheck,
  TrendingUp,
  Shield,
  FileText,
  BarChart,
  Bell,
  Gift,
  Globe,
  Lock,
  Zap,
  Mail,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Cloud,
  Smartphone,
  Headphones,
  Briefcase,
  Award,
  PieChart,
  Settings,
  Database,
  Key,
  Eye,
  Download,
  Upload,
  Filter,
  Search,
  Star
} from 'lucide-react';

const Features = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Features' },
    { id: 'core', name: 'Core HR' },
    { id: 'payroll', name: 'Payroll' },
    { id: 'attendance', name: 'Attendance' },
    { id: 'performance', name: 'Performance' },
    { id: 'security', name: 'Security' }
  ];

  const features = [
    {
      category: 'core',
      icon: Users,
      title: 'Employee Database',
      description: 'Centralized employee information management with custom fields and document storage.',
      benefits: ['Custom fields', 'Document management', 'Advanced search', 'Bulk operations'],
      color: 'from-blue-500 to-indigo-500',
      popular: true
    },
    {
      category: 'core',
      icon: Briefcase,
      title: 'Onboarding & Offboarding',
      description: 'Streamlined processes for employee lifecycle management.',
      benefits: ['Digital paperwork', 'Task checklists', 'Automated workflows', 'Welcome emails'],
      color: 'from-indigo-500 to-purple-500',
      popular: false
    },
    {
      category: 'attendance',
      icon: Clock,
      title: 'Time Tracking',
      description: 'Real-time attendance monitoring with multiple clock-in methods.',
      benefits: ['Biometric support', 'Geofencing', 'Overtime tracking', 'Shift scheduling'],
      color: 'from-purple-500 to-pink-500',
      popular: true
    },
    {
      category: 'attendance',
      icon: CalendarCheck,
      title: 'Leave Management',
      description: 'Flexible leave policies with automated approval workflows.',
      benefits: ['Multiple leave types', 'Balance tracking', 'Calendar sync', 'Approval chains'],
      color: 'from-pink-500 to-rose-500',
      popular: false
    },
    {
      category: 'payroll',
      icon: DollarSign,
      title: 'Payroll Processing',
      description: 'Automated payroll with tax calculations and direct deposit.',
      benefits: ['Tax compliance', 'Direct deposit', 'Pay stubs', 'Year-end forms'],
      color: 'from-rose-500 to-orange-500',
      popular: true
    },
    {
      category: 'payroll',
      icon: Gift,
      title: 'Benefits Administration',
      description: 'Comprehensive benefits management and enrollment.',
      benefits: ['Health insurance', 'Retirement plans', 'Flexible spending', 'COBRA'],
      color: 'from-orange-500 to-amber-500',
      popular: false
    },
    {
      category: 'performance',
      icon: TrendingUp,
      title: 'Performance Reviews',
      description: 'Customizable review cycles with 360-degree feedback.',
      benefits: ['Goal tracking', 'Peer reviews', 'Self assessments', 'Rating scales'],
      color: 'from-amber-500 to-yellow-500',
      popular: true
    },
    {
      category: 'performance',
      icon: Award,
      title: 'Recognition & Rewards',
      description: 'Employee recognition programs and reward management.',
      benefits: ['Peer recognition', 'Points system', 'Reward catalog', 'Anniversaries'],
      color: 'from-yellow-500 to-lime-500',
      popular: false
    },
    {
      category: 'security',
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Granular permissions and access control for data security.',
      benefits: ['Custom roles', 'Data encryption', 'Audit logs', 'SSO integration'],
      color: 'from-lime-500 to-green-500',
      popular: true
    },
    {
      category: 'security',
      icon: Lock,
      title: 'Compliance Management',
      description: 'Stay compliant with labor laws and regulations.',
      benefits: ['Auto updates', 'Compliance reports', 'Document retention', 'Policy management'],
      color: 'from-green-500 to-emerald-500',
      popular: false
    },
    {
      category: 'core',
      icon: FileText,
      title: 'Document Management',
      description: 'Secure storage and management of employee documents.',
      benefits: ['Version control', 'E-signatures', 'Expiry alerts', 'Template library'],
      color: 'from-emerald-500 to-teal-500',
      popular: false
    },
    {
      category: 'performance',
      icon: BarChart,
      title: 'Analytics & Reports',
      description: 'Data-driven insights with customizable dashboards.',
      benefits: ['Real-time metrics', 'Custom reports', 'Trend analysis', 'Export options'],
      color: 'from-teal-500 to-cyan-500',
      popular: true
    }
  ];

  const integrations = [
    { name: 'Slack', icon: '💬', color: 'bg-purple-100' },
    { name: 'G Suite', icon: '📧', color: 'bg-blue-100' },
    { name: 'QuickBooks', icon: '💰', color: 'bg-green-100' },
    { name: 'Zoom', icon: '📹', color: 'bg-cyan-100' },
    { name: 'Salesforce', icon: '☁️', color: 'bg-blue-100' },
    { name: 'Microsoft 365', icon: '📊', color: 'bg-orange-100' },
    { name: 'Xero', icon: '📈', color: 'bg-emerald-100' },
    { name: 'Asana', icon: '✅', color: 'bg-pink-100' }
  ];

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative pt-24 lg:pt-32 pb-20 overflow-hidden">
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
              <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                Powerful Features
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Everything you need to
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                manage your team
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
            >
              From onboarding to payroll, our comprehensive suite of tools helps you streamline every aspect of HR management.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
              >
                {feature.popular && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full">
                      <Star className="w-3 h-3" />
                      Popular
                    </span>
                  </div>
                )}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-6 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:gap-2 transition-all group/link"
                >
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Seamless Integrations
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Connect with the tools you already use
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800"
              >
                <div className={`w-16 h-16 ${integration.color} dark:bg-opacity-20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4`}>
                  {integration.icon}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {integration.name}
                </h3>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <a
              href="#"
              className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:gap-2 transition-all group"
            >
              View all integrations
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Enterprise-ready features for growing teams
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Shield,
                    title: 'Advanced Security',
                    description: 'SOC2 Type II certified with end-to-end encryption'
                  },
                  {
                    icon: Globe,
                    title: 'Global Compliance',
                    description: 'Stay compliant with local labor laws worldwide'
                  },
                  {
                    icon: Database,
                    title: 'Unlimited Storage',
                    description: 'Store all your HR documents securely in the cloud'
                  },
                  {
                    icon: Headphones,
                    title: 'Priority Support',
                    description: '24/7 dedicated support with SLA guarantees'
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
                  alt="Enterprise"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 mix-blend-overlay" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
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
                Ready to transform your HR?
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join thousands of companies already using our platform to streamline their HR operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group px-8 py-4 bg-white text-indigo-600 rounded-full font-medium hover:shadow-2xl hover:scale-105 transition-all duration-300">
                  Start Free Trial
                  <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 bg-indigo-500/20 text-white border border-indigo-300/30 rounded-full font-medium hover:bg-indigo-500/30 transition-all duration-300">
                  Schedule Demo
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Features;