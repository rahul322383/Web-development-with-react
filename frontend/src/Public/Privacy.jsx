import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  Database,
  Globe,
  Cookie,
  FileText,
  CheckCircle,
  ArrowRight,
  Download,
  Mail,
  AlertCircle,
  Smartphone,
  Cloud,
  Users
} from 'lucide-react';

const Privacy = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: Eye },
    { id: 'collection', title: 'Data Collection', icon: Database },
    { id: 'usage', title: 'How We Use Data', icon: Globe },
    { id: 'cookies', title: 'Cookies', icon: Cookie },
    { id: 'rights', title: 'Your Rights', icon: Shield },
    { id: 'contact', title: 'Contact Us', icon: Mail }
  ];

  const dataTypes = [
    {
      category: 'Personal Information',
      items: ['Name and contact information', 'Date of birth', 'Government ID', 'Employment history']
    },
    {
      category: 'Employment Data',
      items: ['Job title and department', 'Salary and benefits', 'Performance reviews', 'Leave records']
    },
    {
      category: 'Technical Data',
      items: ['IP address', 'Browser type', 'Device information', 'Usage data']
    }
  ];

  const rights = [
    {
      icon: Eye,
      title: 'Right to Access',
      description: 'You can request a copy of your personal data we hold.'
    },
    {
      icon: FileText,
      title: 'Right to Rectification',
      description: 'You can request corrections to inaccurate data.'
    },
    {
      icon: Database,
      title: 'Right to Erasure',
      description: 'You can request deletion of your data in certain circumstances.'
    },
    {
      icon: Lock,
      title: 'Right to Restrict',
      description: 'You can restrict the processing of your data.'
    }
  ];

  const lastUpdated = 'March 15, 2024';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero */}
      <section className="relative pt-24 lg:pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />
        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full px-4 py-2 mb-6"
          >
            <Shield className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Privacy Policy
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Your privacy is
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              our priority
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Learn how we collect, use, and protect your information
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-sm text-slate-500"
          >
            Last updated: {lastUpdated}
          </motion.div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="sticky top-20 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto no-scrollbar gap-2 py-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Our Commitment to Privacy
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                At HRMS, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information when you use our platform. We comply with GDPR, CCPA, and other applicable privacy laws.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                      TL;DR Summary
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                      <li>• We only collect data necessary to provide our services</li>
                      <li>• We never sell your personal information</li>
                      <li>• You can access, modify, or delete your data anytime</li>
                      <li>• We use industry-standard security measures</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Data Collection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Information We Collect
              </h2>
              <div className="space-y-6">
                {dataTypes.map((type, index) => (
                  <div key={index} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                      {type.category}
                    </h3>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {type.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* How We Use Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                How We Use Your Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Provide and maintain our services',
                  'Process payroll and benefits',
                  'Communicate with you',
                  'Improve our platform',
                  'Ensure security and prevent fraud',
                  'Comply with legal obligations'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Cookies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Cookies and Tracking
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We use cookies and similar technologies to enhance your experience, analyze traffic, and personalize content. You can control cookies through your browser settings.
              </p>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Types of cookies we use:</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li>• <strong>Essential:</strong> Required for platform functionality</li>
                  <li>• <strong>Analytics:</strong> Help us understand usage patterns</li>
                  <li>• <strong>Preferences:</strong> Remember your settings</li>
                </ul>
              </div>
            </motion.div>

            {/* Your Rights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Your Privacy Rights
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {rights.map((right, index) => (
                  <div key={index} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                    <right.icon className="w-8 h-8 text-indigo-600 mb-4" />
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {right.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {right.description}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500">
                To exercise any of these rights, please contact us at privacy@hrms.com
              </p>
            </motion.div>

            {/* Data Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Data Security
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                We implement industry-standard security measures to protect your data:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: Lock, text: 'End-to-end encryption' },
                  { icon: Shield, text: 'Regular security audits' },
                  { icon: Cloud, text: 'Secure cloud storage' },
                  { icon: Users, text: 'Access controls' },
                  { icon: Smartphone, text: 'Multi-factor authentication' },
                  { icon: Database, text: 'Automated backups' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <item.icon className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Contact Us
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                If you have questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-indigo-600" />
                    <span className="text-slate-600 dark:text-slate-400">privacy@hrms.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-indigo-600" />
                    <span className="text-slate-600 dark:text-slate-400">www.hrms.com/privacy</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <span className="text-slate-600 dark:text-slate-400">123 Market St, San Francisco, CA 94105</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Download Policy */}
            <div className="text-center">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                <Download className="w-4 h-4" />
                Download Privacy Policy (PDF)
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;