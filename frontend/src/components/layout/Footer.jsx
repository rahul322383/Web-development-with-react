import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

const APP_NAME = 'HRMS';

const footerSections = [
  {
    id: 'product',
    title: 'Product',
    links: [
      { name: 'Features', href: '/features', icon: 'Sparkles' },
      { name: 'Pricing', href: '/pricing', icon: 'CreditCard' },
      { name: 'For Enterprise', href: '/enterprise', icon: 'Briefcase' },
      { name: 'Security', href: '/security', icon: 'Shield' }
    ]
  },
  {
    id: 'resources',
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '/docs', icon: 'BookOpen' },
      { name: 'Guides', href: '/guides', icon: 'FileText' },
      { name: 'API Reference', href: '/api', icon: 'Globe' },
      { name: 'Community', href: '/community', icon: 'Users' }
    ]
  },
  {
    id: 'company',
    title: 'Company',
    links: [
      { name: 'About', href: '/about', icon: 'Users' },
      { name: 'Blog', href: '/blog', icon: 'MessageSquare' },
      { name: 'Careers', href: 'https://careers.example.com', icon: 'Briefcase' },
      { name: 'Contact', href: '/contact', icon: 'Mail' }
    ]
  },
  {
    id: 'legal',
    title: 'Legal',
    links: [
      { name: 'Privacy', href: '/privacy', icon: 'Lock' },
      { name: 'Terms', href: '/terms', icon: 'Scale' },
      { name: 'Cookies', href: '/cookies', icon: 'FileText' },
      { name: 'Compliance', href: '/compliance', icon: 'Shield' }
    ]
  }
];

const socialLinks = [
  { icon: 'Github', href: 'https://github.com/yourcompany', label: 'GitHub' },
  { icon: 'Linkedin', href: 'https://linkedin.com/company/yourcompany', label: 'LinkedIn' },
  { icon: 'Twitter', href: 'https://twitter.com/yourcompany', label: 'Twitter' },
  { icon: 'Mail', href: 'mailto:contact@company.com', label: 'Email' }
];

// Memoized to prevent re-renders in static footer
const FooterLink = memo(({ link }) => {
  const Icon = Icons[link.icon] || Icons.FileText;
  const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto');

  const commonProps = {
    className: "group inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
  };

  const content = (
    <>
      <Icon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span>{link.name}</span>
    </>
  );

  return isExternal ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" {...commonProps}>
      {content}
    </a>
  ) : (
    <Link to={link.href} {...commonProps}>
      {content}
    </Link>
  );
});

FooterLink.displayName = 'FooterLink';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav aria-label="Footer Navigation" className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Branding Section */}
            <div className="lg:col-span-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Icons.Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-slate-900 dark:text-white">
                  {APP_NAME}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed max-w-sm">
                Modern HR management platform helping teams build better workplaces through streamlined operations and data-driven insights.
              </p>

              <div className="flex items-center space-x-3">
                {socialLinks.map(({ icon, href, label }) => {
                  const SocialIcon = Icons[icon] || Icons.Mail;
                  return (
                    <motion.a
                      key={label}
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors group"
                      aria-label={label}
                    >
                      <SocialIcon className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                    </motion.a>
                  );
                })}
              </div>
            </div>

            {/* Nav Sections */}
            {footerSections.map((section) => (
              <div key={section.id} className="lg:col-span-2">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <FooterLink link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Bottom Bar */}
        <div className="py-6 flex flex-wrap items-center justify-between border-t border-slate-200 dark:border-slate-800">
          <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
            <span>&copy; {currentYear} {APP_NAME}.</span>
            <span className="hidden sm:inline-flex items-center gap-1 ml-2 text-xs text-slate-500">
              Made with <Icons.Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> by {APP_NAME} Team
            </span>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 transition-all shadow-sm"
            aria-label="Scroll to top"
          >
            <Icons.ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};