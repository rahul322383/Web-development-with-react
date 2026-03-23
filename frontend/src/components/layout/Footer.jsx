import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Github,
  Linkedin,
  Twitter,
  Mail,
  Heart,
  ArrowUp,
  Briefcase,
  FileText,
  Users,
  Shield,
  Scale,
  Lock,
  HelpCircle,
  BookOpen,
  CreditCard,
  Globe,
  MessageSquare
} from 'lucide-react';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '/features', icon: Sparkles },
        { name: 'Pricing', href: '/pricing', icon: CreditCard },
        { name: 'For Enterprise', href: '/enterprise', icon: Briefcase },
        { name: 'Security', href: '/security', icon: Shield }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/docs', icon: BookOpen },
        { name: 'Guides', href: '/guides', icon: FileText },
        { name: 'API Reference', href: '/api', icon: Globe },
        { name: 'Community', href: '/community', icon: Users }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about', icon: Users },
        { name: 'Blog', href: '/blog', icon: MessageSquare },
        { name: 'Careers', href: '/careers', icon: Briefcase },
        { name: 'Contact', href: '/contact', icon: Mail }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy', href: '/privacy', icon: Lock },
        { name: 'Terms', href: '/terms', icon: Scale },
        { name: 'Cookies', href: '/cookies', icon: FileText },
        { name: 'Compliance', href: '/compliance', icon: Shield }
      ]
    }
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com/yourcompany', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/company/yourcompany', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com/yourcompany', label: 'Twitter' },
    { icon: Mail, href: 'mailto:contact@company.com', label: 'Email' }
  ];

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                  HRMS
                </span>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed max-w-sm">
                Modern HR management platform helping teams build better workplaces through streamlined operations and data-driven insights.
              </p>

              {/* Social Links */}
              <div className="flex items-center space-x-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Footer Sections */}
            {footerSections.map((section) => (
              <div key={section.title} className="lg:col-span-2">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="group inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <link.icon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges - Optional, can be removed if not needed */}
        <div className="py-4 flex flex-wrap items-center justify-center gap-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
              © {currentYear} HRMS. All rights reserved.
              <span className="hidden sm:inline-flex items-center gap-1 ml-2 text-xs text-slate-500">
                Made with <Heart className="w-3 h-3 text-rose-500" /> by HRMS Team
              </span>
            </p>

        </div>
      </div>
    </footer>
  );
};