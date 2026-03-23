import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Key,
  Fingerprint,
  Server,
  Cloud,
  CheckCircle,
  AlertTriangle,
  Award,
  Globe,
  Clock,
  Users,
  Eye,
  FileCheck,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

const Security = () => {
  const certifications = [
    {
      name: 'SOC 2 Type II',
      description: 'Certified for security, availability, and confidentiality',
      icon: Award,
      status: 'Certified'
    },
    {
      name: 'ISO 27001',
      description: 'Information security management standard',
      icon: Shield,
      status: 'Compliant'
    },
    {
      name: 'GDPR',
      description: 'European data protection regulation',
      icon: Globe,
      status: 'Compliant'
    },
    {
      name: 'CCPA',
      description: 'California Consumer Privacy Act',
      icon: FileCheck,
      status: 'Compliant'
    }
  ];

  const features = [
    {
      category: 'Data Encryption',
      items: [
        { icon: Lock, title: 'AES-256 encryption', description: 'All data encrypted at rest' },
        { icon: Lock, title: 'TLS 1.3', description: 'Secure data in transit' },
        { icon: Key, title: 'End-to-end encryption', description: 'For sensitive data' }
      ]
    },
    {
      category: 'Access Control',
      items: [
        { icon: Fingerprint, title: 'Multi-factor authentication', description: 'SMS, authenticator apps, biometrics' },
        { icon: Users, title: 'Role-based access', description: 'Granular permission controls' },
        { icon: Eye, title: 'Session management', description: 'Real-time session monitoring' }
      ]
    },
    {
      category: 'Infrastructure',
      items: [
        { icon: Server, title: 'AWS infrastructure', description: 'Enterprise-grade cloud hosting' },
        { icon: Cloud, title: '99.99% uptime SLA', description: 'High availability architecture' },
        { icon: RefreshCw, title: 'Automated backups', description: 'Point-in-time recovery' }
      ]
    }
  ];

  const compliance = [
    {
      standard: 'Data Protection',
      details: 'GDPR, CCPA, LGPD compliant with data subject rights'
    },
    {
      standard: 'Security Standards',
      details: 'SOC 2 Type II, ISO 27001 certified'
    },
    {
      standard: 'Industry Specific',
      details: 'HIPAA eligible, FINRA compliant'
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
            <Shield className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Enterprise Security
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Security is at our
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              core
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            We protect your data with enterprise-grade security measures
          </motion.p>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12"
          >
            Certifications & Compliance
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 text-center border border-slate-200 dark:border-slate-800"
              >
                <cert.icon className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {cert.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {cert.description}
                </p>
                <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                  {cert.status}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12"
          >
            Security Features
          </motion.h2>

          <div className="space-y-8 max-w-5xl mx-auto">
            {features.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
              >
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  {section.category}
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {section.items.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                      <item.icon className="w-8 h-8 text-indigo-600 mb-4" />
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Standards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-4"
            >
              Compliance Standards
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center text-slate-600 dark:text-slate-400 mb-12"
            >
              We adhere to global security and privacy standards
            </motion.p>

            <div className="space-y-4">
              {compliance.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        {item.standard}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {item.details}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Stats */}
      <section className="py-16 bg-gradient-to-br from-indigo-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="text-4xl font-bold mb-2">100%</div>
              <p className="text-indigo-100">Data encrypted</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold mb-2">99.99%</div>
              <p className="text-indigo-100">Uptime SLA</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-indigo-100">Security monitoring</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vulnerability Disclosure */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Responsible Disclosure
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    If you discover a security vulnerability, we appreciate your help in disclosing it responsibly. Please report security issues to our security team.
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                    <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                      security@hrms.com
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 mt-4">
                    We aim to respond within 24 hours and resolve critical issues within 7 days.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Want to learn more about our security?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              Download our security whitepaper or schedule a security review with our team.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                Download Whitepaper
              </button>
              <button className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:border-indigo-600 transition-colors">
                Contact Security Team
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Security;