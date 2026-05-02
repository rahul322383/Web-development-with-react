'use strict';

// publicSeeder.js
// Run: node publicSeeder.js
// Seeds all data needed by About, Features, Pricing, Contact, Demo, Help, Security, Privacy, Terms, Home pages.

const sequelize = require('../src/database/sequelize');
const {
    SiteStat, Testimonial, TeamMember, Milestone, Feature, Integration,
    PricingPlan, HelpCategory, HelpArticle, FAQ, Tutorial,
    SecurityCertification, LegalDocument, ContactOffice,
} = require('../src/database/initModels');
'use strict';

// publicSeeder.js
// Run: node publicSeeder.js
// Seeds all data needed by About, Features, Pricing, Contact, Demo, Help, Security, Privacy, Terms, Home pages.


const seed = async () => {
    await sequelize.authenticate();
    console.log('DB connected — seeding public data...\n');

    // ── 1. SITE STATS ─────────────────────────────────────────────
    await SiteStat.bulkCreate([
        { key: 'companies', value: '2.5K+', label: 'Companies Using', icon: 'Building2', sortOrder: 1 },
        { key: 'employees', value: '50K+', label: 'Employees Managed', icon: 'Briefcase', sortOrder: 2 },
        { key: 'satisfaction', value: '99.9%', label: 'Satisfaction Rate', icon: 'Star', sortOrder: 3 },
        { key: 'support', value: '24/7', label: 'Support Available', icon: 'Clock', sortOrder: 4 },
        // About page extra stats
        { key: 'founded', value: '2018', label: 'Founded', icon: 'Clock', sortOrder: 5 },
        { key: 'team', value: '50+', label: 'Team Members', icon: 'Users', sortOrder: 6 },
        { key: 'retention', value: '98%', label: 'Retention Rate', icon: 'Star', sortOrder: 7 },
    ], { updateOnDuplicate: ['value', 'label', 'icon', 'sortOrder'] });
    console.log('✅ SiteStats seeded');

    // ── 2. TESTIMONIALS ───────────────────────────────────────────
    await Testimonial.bulkCreate([
        { name: 'Sarah Johnson', role: 'HR Director, TechCorp', content: 'This platform has transformed how we manage our workforce. The automation saves us 20+ hours weekly.', avatar: 'https://i.pravatar.cc/150?img=1', rating: 5, page: 'home', sortOrder: 1 },
        { name: 'Michael Chen', role: 'CEO, GrowthStartup', content: 'The most intuitive HRMS I have ever used. Our team adoption rate was over 90% in the first week.', avatar: 'https://i.pravatar.cc/150?img=2', rating: 5, page: 'home', sortOrder: 2 },
        { name: 'Emily Rodriguez', role: 'Operations Lead, ScaleFlow', content: 'The analytics and reporting capabilities are outstanding. It gives us insights we never had before.', avatar: 'https://i.pravatar.cc/150?img=3', rating: 5, page: 'home', sortOrder: 3 },
        { name: 'Sarah Chen', role: 'HR Manager', content: 'The demo was incredibly helpful. Saw exactly how HRMS would work for our team.', avatar: 'https://i.pravatar.cc/40?img=1', rating: 5, page: 'demo', sortOrder: 1 },
        { name: 'Mike Ross', role: 'HR Manager', content: 'Brilliant walk-through. We signed up the same day after seeing the payroll module in action.', avatar: 'https://i.pravatar.cc/40?img=2', rating: 5, page: 'demo', sortOrder: 2 },
        { name: 'Lisa Wong', role: 'HR Manager', content: 'Very thorough and personalised. The product expert answered every question we had about compliance.', avatar: 'https://i.pravatar.cc/40?img=3', rating: 5, page: 'demo', sortOrder: 3 },
    ], { updateOnDuplicate: ['name', 'role', 'content', 'avatar', 'rating', 'page', 'sortOrder'] });
    console.log('✅ Testimonials seeded');

    // ── 3. TEAM MEMBERS ───────────────────────────────────────────
    await TeamMember.bulkCreate([
        { name: 'Sarah Mitchell', role: 'CEO & Co-Founder', bio: 'Former HR Tech leader with 15+ years of experience in transforming workplace management.', image: 'https://i.pravatar.cc/400?img=1', linkedinUrl: '#', twitterUrl: '#', email: 'sarah@hrms.com', sortOrder: 1 },
        { name: 'David Chen', role: 'CTO & Co-Founder', bio: 'Tech visionary with expertise in building scalable HR solutions for enterprise clients.', image: 'https://i.pravatar.cc/400?img=2', linkedinUrl: '#', twitterUrl: '#', email: 'david@hrms.com', sortOrder: 2 },
        { name: 'Emily Rodriguez', role: 'Head of Product', bio: 'Passionate about creating intuitive experiences that simplify complex HR processes.', image: 'https://i.pravatar.cc/400?img=3', linkedinUrl: '#', twitterUrl: '#', email: 'emily@hrms.com', sortOrder: 3 },
        { name: 'Michael Okonkwo', role: 'Engineering Lead', bio: 'Leading technical innovation and ensuring our platform remains reliable and secure.', image: 'https://i.pravatar.cc/400?img=4', linkedinUrl: '#', twitterUrl: '#', email: 'michael@hrms.com', sortOrder: 4 },
    ], { updateOnDuplicate: ['name', 'role', 'bio', 'image', 'linkedinUrl', 'twitterUrl', 'email', 'sortOrder'] });
    console.log('✅ TeamMembers seeded');

    // ── 4. MILESTONES ─────────────────────────────────────────────
    await Milestone.bulkCreate([
        { year: '2018', title: 'The Beginning', description: 'Founded with a mission to modernize HR management for growing teams.', icon: 'Rocket', sortOrder: 1 },
        { year: '2019', title: 'First 100 Customers', description: 'Reached 100 companies trusting our platform for their HR needs.', icon: 'Users', sortOrder: 2 },
        { year: '2020', title: 'Remote Work Revolution', description: 'Launched remote workforce management features to support distributed teams.', icon: 'Globe', sortOrder: 3 },
        { year: '2021', title: 'Series A Funding', description: 'Raised $20M to accelerate product development and expand our team.', icon: 'Award', sortOrder: 4 },
        { year: '2022', title: 'Global Expansion', description: 'Opened offices in Europe and Asia to serve international clients better.', icon: 'Building2', sortOrder: 5 },
        { year: '2023', title: 'AI-Powered Insights', description: 'Introduced AI-driven analytics to help companies make data-backed decisions.', icon: 'Zap', sortOrder: 6 },
    ], { updateOnDuplicate: ['year', 'title', 'description', 'icon', 'sortOrder'] });
    console.log('✅ Milestones seeded');

    // ── 5. FEATURES ───────────────────────────────────────────────
    await Feature.bulkCreate([
        { category: 'core', icon: 'Users', title: 'Employee Database', description: 'Centralized employee information management with custom fields and document storage.', benefits: JSON.stringify(['Custom fields', 'Document management', 'Advanced search', 'Bulk operations']), color: 'from-blue-500 to-indigo-500', isPopular: true, showOnHome: true, sortOrder: 1 },
        { category: 'core', icon: 'Briefcase', title: 'Onboarding & Offboarding', description: 'Streamlined processes for employee lifecycle management.', benefits: JSON.stringify(['Digital paperwork', 'Task checklists', 'Automated workflows', 'Welcome emails']), color: 'from-indigo-500 to-purple-500', isPopular: false, showOnHome: false, sortOrder: 2 },
        { category: 'attendance', icon: 'Clock', title: 'Time Tracking', description: 'Real-time attendance monitoring with multiple clock-in methods.', benefits: JSON.stringify(['Biometric support', 'Geofencing', 'Overtime tracking', 'Shift scheduling']), color: 'from-purple-500 to-pink-500', isPopular: true, showOnHome: true, sortOrder: 3 },
        { category: 'attendance', icon: 'CalendarCheck', title: 'Leave Management', description: 'Flexible leave policies with automated approval workflows.', benefits: JSON.stringify(['Multiple leave types', 'Balance tracking', 'Calendar sync', 'Approval chains']), color: 'from-pink-500 to-rose-500', isPopular: false, showOnHome: true, sortOrder: 4 },
        { category: 'payroll', icon: 'DollarSign', title: 'Payroll Processing', description: 'Automated payroll with tax calculations and direct deposit.', benefits: JSON.stringify(['Tax compliance', 'Direct deposit', 'Pay stubs', 'Year-end forms']), color: 'from-rose-500 to-orange-500', isPopular: true, showOnHome: true, sortOrder: 5 },
        { category: 'payroll', icon: 'Gift', title: 'Benefits Administration', description: 'Comprehensive benefits management and enrollment.', benefits: JSON.stringify(['Health insurance', 'Retirement plans', 'Flexible spending', 'COBRA']), color: 'from-orange-500 to-amber-500', isPopular: false, showOnHome: false, sortOrder: 6 },
        { category: 'performance', icon: 'TrendingUp', title: 'Performance Reviews', description: 'Customizable review cycles with 360-degree feedback.', benefits: JSON.stringify(['Goal tracking', 'Peer reviews', 'Self assessments', 'Rating scales']), color: 'from-amber-500 to-yellow-500', isPopular: true, showOnHome: true, sortOrder: 7 },
        { category: 'performance', icon: 'Award', title: 'Recognition & Rewards', description: 'Employee recognition programs and reward management.', benefits: JSON.stringify(['Peer recognition', 'Points system', 'Reward catalog', 'Anniversaries']), color: 'from-yellow-500 to-lime-500', isPopular: false, showOnHome: false, sortOrder: 8 },
        { category: 'security', icon: 'Shield', title: 'Role-Based Access', description: 'Granular permissions and access control for data security.', benefits: JSON.stringify(['Custom roles', 'Data encryption', 'Audit logs', 'SSO integration']), color: 'from-lime-500 to-green-500', isPopular: true, showOnHome: true, sortOrder: 9 },
        { category: 'security', icon: 'Lock', title: 'Compliance Management', description: 'Stay compliant with labor laws and regulations.', benefits: JSON.stringify(['Auto updates', 'Compliance reports', 'Document retention', 'Policy management']), color: 'from-green-500 to-emerald-500', isPopular: false, showOnHome: false, sortOrder: 10 },
        { category: 'core', icon: 'FileText', title: 'Document Management', description: 'Secure storage and management of employee documents.', benefits: JSON.stringify(['Version control', 'E-signatures', 'Expiry alerts', 'Template library']), color: 'from-emerald-500 to-teal-500', isPopular: false, showOnHome: false, sortOrder: 11 },
        { category: 'performance', icon: 'BarChart', title: 'Analytics & Reports', description: 'Data-driven insights with customizable dashboards.', benefits: JSON.stringify(['Real-time metrics', 'Custom reports', 'Trend analysis', 'Export options']), color: 'from-teal-500 to-cyan-500', isPopular: true, showOnHome: false, sortOrder: 12 },
    ], { updateOnDuplicate: ['category', 'icon', 'title', 'description', 'benefits', 'color', 'isPopular', 'showOnHome', 'sortOrder'] });
    console.log('✅ Features seeded');

    // ── 6. INTEGRATIONS ───────────────────────────────────────────
    await Integration.bulkCreate([
        { name: 'Slack', icon: '💬', color: 'bg-purple-100', sortOrder: 1 },
        { name: 'G Suite', icon: '📧', color: 'bg-blue-100', sortOrder: 2 },
        { name: 'QuickBooks', icon: '💰', color: 'bg-green-100', sortOrder: 3 },
        { name: 'Zoom', icon: '📹', color: 'bg-cyan-100', sortOrder: 4 },
        { name: 'Salesforce', icon: '☁️', color: 'bg-blue-100', sortOrder: 5 },
        { name: 'Microsoft 365', icon: '📊', color: 'bg-orange-100', sortOrder: 6 },
        { name: 'Xero', icon: '📈', color: 'bg-emerald-100', sortOrder: 7 },
        { name: 'Asana', icon: '✅', color: 'bg-pink-100', sortOrder: 8 },
    ], { updateOnDuplicate: ['name', 'icon', 'color', 'sortOrder'] });
    console.log('✅ Integrations seeded');

    // ── 7. PRICING PLANS ──────────────────────────────────────────
    await PricingPlan.bulkCreate([
        {
            name: 'Starter', description: 'Perfect for small teams getting started',
            monthlyPrice: 29, yearlyPrice: 290, icon: 'Users', color: 'from-blue-500 to-indigo-500',
            features: JSON.stringify(['Up to 50 employees', 'Basic HR management', 'Leave tracking', 'Attendance reports', 'Email support', 'Mobile app access']),
            notIncluded: JSON.stringify(['Payroll integration', 'Performance reviews', 'Advanced analytics']),
            isPopular: false, sortOrder: 1,
        },
        {
            name: 'Professional', description: 'Ideal for growing companies',
            monthlyPrice: 79, yearlyPrice: 790, icon: 'Building2', color: 'from-indigo-500 to-purple-500',
            features: JSON.stringify(['Up to 200 employees', 'Everything in Starter', 'Payroll processing', 'Performance reviews', 'Custom reports', 'Priority support', 'API access']),
            notIncluded: JSON.stringify(['Enterprise SSO', 'Dedicated account manager']),
            isPopular: true, sortOrder: 2,
        },
        {
            name: 'Enterprise', description: 'For large organizations',
            monthlyPrice: 199, yearlyPrice: 1990, icon: 'Building2', color: 'from-purple-500 to-pink-500',
            features: JSON.stringify(['Unlimited employees', 'Everything in Professional', 'Advanced security', 'Custom integrations', 'SLA guarantee', 'Dedicated support', 'Training sessions']),
            notIncluded: JSON.stringify([]),
            isPopular: false, sortOrder: 3,
        },
    ], { updateOnDuplicate: ['name', 'description', 'monthlyPrice', 'yearlyPrice', 'features', 'notIncluded', 'isPopular', 'sortOrder'] });
    console.log('✅ PricingPlans seeded');

    // ── 8. HELP CATEGORIES ────────────────────────────────────────
    const helpCats = await HelpCategory.bulkCreate([
        { icon: 'BookOpen', title: 'Getting Started', description: 'New to HRMS? Start here to learn the basics.', color: 'from-blue-500 to-indigo-500', articleCount: 12, sortOrder: 1 },
        { icon: 'Users', title: 'Employee Management', description: 'Manage employees, roles, and permissions.', color: 'from-indigo-500 to-purple-500', articleCount: 8, sortOrder: 2 },
        { icon: 'Clock', title: 'Attendance & Leave', description: 'Track attendance and manage leave requests.', color: 'from-purple-500 to-pink-500', articleCount: 10, sortOrder: 3 },
        { icon: 'Shield', title: 'Payroll & Benefits', description: 'Process payroll and manage employee benefits.', color: 'from-pink-500 to-rose-500', articleCount: 15, sortOrder: 4 },
        { icon: 'Zap', title: 'Performance Reviews', description: 'Conduct reviews and track employee performance.', color: 'from-rose-500 to-orange-500', articleCount: 7, sortOrder: 5 },
        { icon: 'Globe', title: 'Integrations', description: 'Connect with your favorite tools and services.', color: 'from-orange-500 to-amber-500', articleCount: 9, sortOrder: 6 },
    ], { updateOnDuplicate: ['icon', 'title', 'description', 'color', 'articleCount', 'sortOrder'] });
    console.log('✅ HelpCategories seeded');

    // ── 9. HELP ARTICLES ─────────────────────────────────────────
    await HelpArticle.bulkCreate([
        { categoryId: helpCats[1].id, title: 'How to add a new employee', icon: 'Users', views: 2345, helpful: 98, isPopular: true, sortOrder: 1 },
        { categoryId: helpCats[3].id, title: 'Setting up payroll for the first time', icon: 'FileText', views: 1890, helpful: 95, isPopular: true, sortOrder: 2 },
        { categoryId: helpCats[2].id, title: 'Managing leave requests and approvals', icon: 'Clock', views: 1567, helpful: 97, isPopular: true, sortOrder: 3 },
        { categoryId: helpCats[1].id, title: 'Understanding role-based permissions', icon: 'Shield', views: 1234, helpful: 96, isPopular: true, sortOrder: 4 },
        { categoryId: helpCats[4].id, title: 'Generating performance reports', icon: 'Zap', views: 1123, helpful: 94, isPopular: true, sortOrder: 5 },
        { categoryId: helpCats[5].id, title: 'Integrating with Slack and Teams', icon: 'Globe', views: 987, helpful: 99, isPopular: true, sortOrder: 6 },
    ], { updateOnDuplicate: ['categoryId', 'title', 'icon', 'views', 'helpful', 'isPopular', 'sortOrder'] });
    console.log('✅ HelpArticles seeded');

    // ── 10. FAQs ─────────────────────────────────────────────────
    await FAQ.bulkCreate([
        // Help page FAQs
        { page: 'help', category: 'Account', question: 'How do I reset my password?', answer: "Go to the login page and click 'Forgot Password'. You'll receive an email with instructions to reset your password. If you don't receive the email within 5 minutes, check your spam folder or contact support.", sortOrder: 1 },
        { page: 'help', category: 'Employees', question: 'How do I add multiple employees at once?', answer: "Navigate to Employees > Bulk Import. You can download the CSV template, fill in your employee data, and upload it back. The system will validate the data and show any errors before processing.", sortOrder: 2 },
        { page: 'help', category: 'Payroll', question: 'How is payroll calculated?', answer: "Payroll is calculated based on base salary, attendance, overtime, deductions, and taxes. You can configure all these settings in Payroll > Settings. The system automatically calculates net pay for each employee.", sortOrder: 3 },
        { page: 'help', category: 'Leave', question: 'Can employees request leave through mobile?', answer: 'Yes! Our mobile app (available on iOS and Android) allows employees to request leave, view their balance, and track approval status on the go.', sortOrder: 4 },
        { page: 'help', category: 'Performance', question: 'How do I set up performance review cycles?', answer: "Go to Performance > Review Cycles and click 'Create New Cycle'. Set the review period, choose participants, and configure the review form. You can schedule automatic reminders and notifications.", sortOrder: 5 },
        { page: 'help', category: 'Integrations', question: 'What integrations are available?', answer: 'We integrate with Slack, Microsoft Teams, Google Workspace, QuickBooks, Xero, Zapier, and many more. Visit our Integrations page to see the full list and setup guides.', sortOrder: 6 },
        // Contact page FAQs
        { page: 'contact', category: 'Support', question: 'How quickly do you respond to inquiries?', answer: 'Our India support team aims to respond within 24 hours during business days (IST).', sortOrder: 1 },
        { page: 'contact', category: 'Support', question: 'Do you offer demo sessions in Indian languages?', answer: 'Yes! We can arrange product demos in Hindi, English, and several regional languages on request.', sortOrder: 2 },
        { page: 'contact', category: 'Support', question: 'What support channels are available for Indian customers?', answer: 'We offer email, phone (Indian toll-free numbers), and live chat support during business hours. Enterprise clients also get a dedicated account manager.', sortOrder: 3 },
        { page: 'contact', category: 'Billing', question: 'Is the platform GST compliant?', answer: 'Absolutely. Our billing and invoicing system is fully GST ready, with support for all Indian states and UT codes.', sortOrder: 4 },
        // Pricing FAQs
        { page: 'pricing', category: 'Plans', question: 'Can I change plans later?', answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.', sortOrder: 1 },
        { page: 'pricing', category: 'Billing', question: 'Is there a setup fee?', answer: 'No, there are no setup fees for any of our plans. You only pay the subscription price.', sortOrder: 2 },
        { page: 'pricing', category: 'Billing', question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.', sortOrder: 3 },
        { page: 'pricing', category: 'Trial', question: 'Do you offer a free trial?', answer: 'Yes, all plans come with a 14-day free trial. No credit card required.', sortOrder: 4 },
    ], { updateOnDuplicate: ['page', 'category', 'question', 'answer', 'sortOrder'] });
    console.log('✅ FAQs seeded');

    // ── 11. TUTORIALS ─────────────────────────────────────────────
    await Tutorial.bulkCreate([
        { title: 'Complete HRMS Walkthrough', duration: '15:30', views: '12K', level: 'Beginner', sortOrder: 1 },
        { title: 'Setting Up Your Company Profile', duration: '8:45', views: '8.5K', level: 'Beginner', sortOrder: 2 },
        { title: 'Advanced Payroll Configuration', duration: '22:15', views: '5.2K', level: 'Advanced', sortOrder: 3 },
        { title: 'Performance Review Best Practices', duration: '18:20', views: '6.7K', level: 'Intermediate', sortOrder: 4 },
    ], { updateOnDuplicate: ['title', 'duration', 'views', 'level', 'sortOrder'] });
    console.log('✅ Tutorials seeded');

    // ── 12. SECURITY CERTIFICATIONS ───────────────────────────────
    await SecurityCertification.bulkCreate([
        { name: 'SOC 2 Type II', description: 'Certified for security, availability, and confidentiality', icon: 'Award', status: 'Certified', sortOrder: 1 },
        { name: 'ISO 27001', description: 'Information security management standard', icon: 'Shield', status: 'Compliant', sortOrder: 2 },
        { name: 'GDPR', description: 'European data protection regulation', icon: 'Globe', status: 'Compliant', sortOrder: 3 },
        { name: 'CCPA', description: 'California Consumer Privacy Act', icon: 'FileCheck', status: 'Compliant', sortOrder: 4 },
    ], { updateOnDuplicate: ['name', 'description', 'icon', 'status', 'sortOrder'] });
    console.log('✅ SecurityCertifications seeded');

    // ── 13. LEGAL DOCUMENTS (Privacy Policy sections) ─────────────
    await LegalDocument.bulkCreate([
        // Privacy
        { type: 'privacy', title: 'Our Commitment to Privacy', sectionKey: 'overview', content: 'At HRMS, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information when you use our platform. We comply with GDPR, CCPA, and other applicable privacy laws.', icon: 'Eye', sortOrder: 1 },
        { type: 'privacy', title: 'Information We Collect', sectionKey: 'collection', content: JSON.stringify({ personalInfo: ['Name and contact information', 'Date of birth', 'Government ID', 'Employment history'], employmentData: ['Job title and department', 'Salary and benefits', 'Performance reviews', 'Leave records'], technicalData: ['IP address', 'Browser type', 'Device information', 'Usage data'] }), icon: 'Database', sortOrder: 2 },
        { type: 'privacy', title: 'How We Use Your Information', sectionKey: 'usage', content: JSON.stringify(['Provide and maintain our services', 'Process payroll and benefits', 'Communicate with you', 'Improve our platform', 'Ensure security and prevent fraud', 'Comply with legal obligations']), icon: 'Globe', sortOrder: 3 },
        { type: 'privacy', title: 'Cookies and Tracking', sectionKey: 'cookies', content: 'We use cookies and similar technologies to enhance your experience, analyze traffic, and personalize content. You can control cookies through your browser settings.', icon: 'Cookie', sortOrder: 4 },
        { type: 'privacy', title: 'Your Privacy Rights', sectionKey: 'rights', content: JSON.stringify([{ title: 'Right to Access', description: 'You can request a copy of your personal data we hold.', icon: 'Eye' }, { title: 'Right to Rectification', description: 'You can request corrections to inaccurate data.', icon: 'FileText' }, { title: 'Right to Erasure', description: 'You can request deletion of your data in certain circumstances.', icon: 'Database' }, { title: 'Right to Restrict', description: 'You can restrict the processing of your data.', icon: 'Lock' }]), icon: 'Shield', sortOrder: 5 },
        { type: 'privacy', title: 'Contact Us', sectionKey: 'contact', content: JSON.stringify({ email: 'privacy@hrms.com', website: 'www.hrms.com/privacy', address: '123 Market St, San Francisco, CA 94105' }), icon: 'Mail', sortOrder: 6 },
        // Terms
        { type: 'terms', title: '1. Acceptance of Terms', sectionKey: 'acceptance', content: 'By accessing or using HRMS, you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not access or use our services.', icon: 'FileText', sortOrder: 1 },
        { type: 'terms', title: '2. Description of Service', sectionKey: 'description', content: 'HRMS provides human resource management software including employee management, payroll processing, attendance tracking, and related features. We reserve the right to modify or discontinue any part of our service with notice.', icon: 'Globe', sortOrder: 2 },
        { type: 'terms', title: '3. User Accounts', sectionKey: 'accounts', content: 'You are responsible for maintaining the security of your account. You must provide accurate and complete information. Notify us immediately of any unauthorized access.', icon: 'Users', sortOrder: 3 },
        { type: 'terms', title: '4. Fees and Payments', sectionKey: 'fees', content: 'Subscription fees are billed in advance on a monthly or annual basis. Fees are non-refundable except as required by law. We may change fees with 30 days notice.', icon: 'DollarSign', sortOrder: 4 },
        { type: 'terms', title: '5. Data Ownership', sectionKey: 'data', content: 'You retain ownership of your data. We claim no intellectual property rights over the information you provide. You grant us permission to use data to provide and improve services.', icon: 'Shield', sortOrder: 5 },
        { type: 'terms', title: '6. Acceptable Use', sectionKey: 'acceptable_use', content: 'You may not use HRMS for illegal purposes, to harass others, distribute malware, or attempt to gain unauthorized access to our systems.', icon: 'Ban', sortOrder: 6 },
        { type: 'terms', title: '7. Termination', sectionKey: 'termination', content: 'Either party may terminate service at any time. Upon termination, you may export your data. We may delete data after 30 days.', icon: 'Clock', sortOrder: 7 },
        { type: 'terms', title: '8. Limitation of Liability', sectionKey: 'liability', content: 'HRMS shall not be liable for indirect, incidental, or consequential damages. Our total liability shall not exceed the amount paid in the last 12 months.', icon: 'Gavel', sortOrder: 8 },
    ], { updateOnDuplicate: ['title', 'sectionKey', 'content', 'icon', 'sortOrder'] });
    console.log('✅ LegalDocuments seeded');

    // ── 14. CONTACT OFFICES ───────────────────────────────────────
    await ContactOffice.bulkCreate([
        { city: 'Bengaluru', address: 'No. 12/A, 4th Floor, Salarpuria Symbiosis, Bannerghatta Main Rd, Bengaluru, Karnataka 560076', phone: '+91 80 1234 5678', email: 'bengaluru@hrms.com', sortOrder: 1 },
        { city: 'Mumbai', address: '201, 2nd Floor, B-Wing, Supreme Business Park, Hiranandani Gardens, Powai, Mumbai 400076', phone: '+91 22 9876 5432', email: 'mumbai@hrms.com', sortOrder: 2 },
    ], { updateOnDuplicate: ['city', 'address', 'phone', 'email', 'sortOrder'] });
    console.log('✅ ContactOffices seeded');

    console.log('\n🎉 All public data seeded successfully!');
    process.exit(0);
};

seed().catch((err) => {
    console.error('❌ Seeder failed:', err);
    process.exit(1);
});