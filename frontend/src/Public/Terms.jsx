import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Scale,
  AlertCircle,
  CheckCircle,
  Globe,
  Mail,
  Clock,
  Users,
  Shield,
  DollarSign,
  Ban,
  Gavel,
  ArrowRight
} from 'lucide-react';

const Terms = () => {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using HRMS, you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not access or use our services.',
      icon: FileText
    },
    {
      title: '2. Description of Service',
      content: 'HRMS provides human resource management software including employee management, payroll processing, attendance tracking, and related features. We reserve the right to modify or discontinue any part of our service with notice.',
      icon: Globe
    },
    {
      title: '3. User Accounts',
      content: 'You are responsible for maintaining the security of your account. You must provide accurate and complete information. Notify us immediately of any unauthorized access.',
      icon: Users
    },
    {
      title: '4. Fees and Payments',
      content: 'Subscription fees are billed in advance on a monthly or annual basis. Fees are non-refundable except as required by law. We may change fees with 30 days notice.',
      icon: DollarSign
    },
    {
      title: '5. Data Ownership',
      content: 'You retain ownership of your data. We claim no intellectual property rights over the information you provide. You grant us permission to use data to provide and improve services.',
      icon: Shield
    },
    {
      title: '6. Acceptable Use',
      content: 'You may not use HRMS for illegal purposes, to harass others, distribute malware, or attempt to gain unauthorized access to our systems.',
      icon: Ban
    },
    {
      title: '7. Termination',
      content: 'Either party may terminate service at any time. Upon termination, you may export your data. We may delete data after 30 days.',
      icon: Clock
    },
    {
      title: '8. Limitation of Liability',
      content: 'HRMS shall not be liable for indirect, incidental, or consequential damages. Our total liability shall not exceed the amount paid in the last 12 months.',
      icon: Gavel
    }
  ];

  const definitions = [
    {
      term: '"Service"',
      definition: 'Refers to the HRMS platform and all associated services'
    },
    {
      term: '"User"',
      definition: 'Any individual or entity using the Service'
    },
    {
      term: '"Content"',
      definition: 'Any data, text, files, or information submitted to the Service'
    }
  ];

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
            <Scale className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Terms of Service
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Our commitment to
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              transparency
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Please read these terms carefully before using our platform
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-sm text-slate-500"
          >
            Last updated: March 15, 2024
          </motion.div>
        </div>
      </section>

      {/* Summary Banner */}
      <section className="py-8 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Quick Summary</h3>
                <p className="text-amber-100 text-sm mb-3">
                  These terms create a legally binding agreement between you and HRMS. 
                  Key points: you own your data, we provide the service, fees are non-refundable, 
                  and our liability is limited. Please read the full terms below.
                </p>
                <button className="text-sm bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                  Jump to Important Sections
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Definitions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-slate-900 dark:text-white mb-6"
            >
              Definitions
            </motion.h2>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800">
              {definitions.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4"
                >
                  <dt className="font-semibold text-slate-900 dark:text-white mb-1">
                    {item.term}
                  </dt>
                  <dd className="text-sm text-slate-600 dark:text-slate-400">
                    {item.definition}
                  </dd>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Terms */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {section.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white"
            >
              <h2 className="text-2xl font-bold mb-4">Questions about our Terms?</h2>
              <p className="text-indigo-100 mb-6">
                Our team is here to help explain any part of these terms.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-medium hover:shadow-lg transition-all">
                  Contact Legal Team
                  <ArrowRight className="inline-block ml-2 w-4 h-4" />
                </button>
                <button className="px-6 py-3 bg-indigo-500/20 border border-indigo-300/30 rounded-xl font-medium hover:bg-indigo-500/30 transition-all">
                  Download Terms (PDF)
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;