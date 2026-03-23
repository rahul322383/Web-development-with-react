import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  Users,
  Building2,
  Zap,
  HelpCircle,
  Star,
  CreditCard,
  Shield,
  Clock,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small teams getting started',
      monthlyPrice: 29,
      yearlyPrice: 290,
      icon: Users,
      features: [
        'Up to 50 employees',
        'Basic HR management',
        'Leave tracking',
        'Attendance reports',
        'Email support',
        'Mobile app access'
      ],
      notIncluded: [
        'Payroll integration',
        'Performance reviews',
        'Advanced analytics'
      ],
      color: 'from-blue-500 to-indigo-500',
      popular: false
    },
    {
      name: 'Professional',
      description: 'Ideal for growing companies',
      monthlyPrice: 79,
      yearlyPrice: 790,
      icon: Building2,
      features: [
        'Up to 200 employees',
        'Everything in Starter',
        'Payroll processing',
        'Performance reviews',
        'Custom reports',
        'Priority support',
        'API access'
      ],
      notIncluded: [
        'Enterprise SSO',
        'Dedicated account manager'
      ],
      color: 'from-indigo-500 to-purple-500',
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'For large organizations',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      icon: Building2,
      features: [
        'Unlimited employees',
        'Everything in Professional',
        'Advanced security',
        'Custom integrations',
        'SLA guarantee',
        'Dedicated support',
        'Training sessions'
      ],
      notIncluded: [],
      color: 'from-purple-500 to-pink-500',
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'Can I change plans later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No, there are no setup fees for any of our plans. You only pay the subscription price.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.'
    },
    {
      question: 'Do you offer a free trial?',
      answer: 'Yes, all plans come with a 14-day free trial. No credit card required.'
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
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Simple, transparent pricing
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Choose the right plan
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              for your team
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            No hidden fees. Cancel anytime.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border ${
                  plan.popular
                    ? 'border-indigo-500 dark:border-indigo-400'
                    : 'border-slate-200 dark:border-slate-800'
                } overflow-hidden`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 text-sm font-medium rounded-bl-xl">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <div className={`w-12 h-12 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center mb-4`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedPlan(plan.name)}
                    className={`w-full py-3 rounded-xl font-medium transition-all mb-6 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                        : 'border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-600'
                    }`}
                  >
                    Get Started
                  </button>

                  <div className="space-y-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {feature}
                        </span>
                      </div>
                    ))}

                    {plan.notIncluded.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 opacity-50">
                        <XCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-2">Need a custom plan?</h3>
                <p className="text-indigo-100">
                  Contact our sales team for enterprise pricing and custom requirements.
                </p>
              </div>
              <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-medium hover:shadow-lg transition-all whitespace-nowrap">
                Contact Sales
                <ArrowRight className="inline-block ml-2 w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12"
          >
            Frequently Asked Questions
          </motion.h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Mail, title: 'Email', desc: 'sales@hrms.com' },
              { icon: Phone, title: 'Phone', desc: '+1 (555) 123-4567' },
              { icon: Calendar, title: 'Demo', desc: 'Schedule a call' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 text-center border border-slate-200 dark:border-slate-800"
              >
                <item.icon className="w-6 h-6 text-indigo-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;