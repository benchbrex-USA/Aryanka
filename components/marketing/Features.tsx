'use client';

import { motion } from 'framer-motion';
import {
  Globe,
  Search,
  Mail,
  BarChart3,
  Users,
  Share2,
  Target,
  Zap,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Share2,
    title: 'Multi-Platform Content Syndication',
    description:
      'Write once. Instantly distribute to LinkedIn, Reddit, Medium, Twitter/X, and YouTube — driving organic traffic from every channel simultaneously.',
    badge: 'Organic Traffic',
    color: 'from-brand-500 to-brand-600',
  },
  {
    icon: Search,
    title: 'SEO-Optimized Blog & Landing Pages',
    description:
      'Auto-generated keyword-rich blog posts, meta tags, schema markup, and dynamic sitemaps that rank on Google without manual effort.',
    badge: 'SEO',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Target,
    title: 'Smart Lead Capture System',
    description:
      'High-converting forms, exit-intent pop-ups, embedded CTAs, and inline captures — all tailored for both B2B and B2C buyer journeys.',
    badge: 'Lead Gen',
    color: 'from-accent-500 to-accent-600',
  },
  {
    icon: Mail,
    title: 'Automated Email Nurture Pipeline',
    description:
      'Behaviorally triggered email sequences that warm up cold leads and guide them to conversion — powered by Resend, free up to 3K/month.',
    badge: 'Email',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Unified Analytics Dashboard',
    description:
      'Track traffic sources, lead quality scores, funnel conversion rates, and revenue attribution — all in one real-time dashboard.',
    badge: 'Analytics',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Users,
    title: 'Built-in CRM Lite',
    description:
      'Manage your entire pipeline — from first touch to closed deal. Lead scoring, stage tracking, and activity logging included.',
    badge: 'CRM',
    color: 'from-cyan-500 to-blue-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-4">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-medium text-brand-300">Everything You Need to Grow</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Your Complete{' '}
            <span className="text-gradient">Growth Engine</span>
          </h2>
          <p className="text-lg text-navy-300 max-w-2xl mx-auto">
            Six powerful modules working together to generate, capture, nurture,
            and convert leads — entirely on organic traffic.
          </p>
        </div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative bg-glass rounded-2xl p-6 hover:bg-white/8 transition-all duration-300 cursor-pointer"
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Badge */}
              <span
                className={`inline-block text-xs font-semibold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent mb-2`}
              >
                {feature.badge}
              </span>

              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-navy-400 leading-relaxed">
                {feature.description}
              </p>

              <div className="mt-4 flex items-center gap-1 text-xs text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn more</span>
                <ArrowRight className="w-3 h-3" />
              </div>

              {/* Hover border glow */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
