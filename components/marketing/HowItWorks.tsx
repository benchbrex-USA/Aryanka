'use client';

import { motion } from 'framer-motion';
import { PenLine, Share2, Target, TrendingUp } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: PenLine,
    title: 'Create Your Content Once',
    description:
      'Write a single piece of high-value content — a blog post, case study, or insight — inside Aryanka\'s built-in editor with SEO recommendations.',
    color: 'brand',
  },
  {
    step: '02',
    icon: Share2,
    title: 'Syndicate Across All Platforms',
    description:
      'Aryanka automatically repurposes and distributes your content to LinkedIn, Reddit, Medium, Twitter/X, and YouTube — driving inbound traffic from every channel.',
    color: 'accent',
  },
  {
    step: '03',
    icon: Target,
    title: 'Capture & Qualify Leads',
    description:
      'Visitors land on your SEO-optimized pages. Smart CTAs, exit-intent pop-ups, and embedded forms capture leads and auto-score them by intent.',
    color: 'purple',
  },
  {
    step: '04',
    icon: TrendingUp,
    title: 'Nurture & Close Automatically',
    description:
      'Triggered email sequences warm up leads while your CRM Lite tracks every interaction — from first touch to signed contract.',
    color: 'yellow',
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  brand: {
    bg: 'bg-brand-500/10',
    text: 'text-brand-400',
    border: 'border-brand-500/30',
    glow: 'shadow-brand-500/20',
  },
  accent: {
    bg: 'bg-accent-500/10',
    text: 'text-accent-400',
    border: 'border-accent-500/30',
    glow: 'shadow-accent-500/20',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/20',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
    glow: 'shadow-yellow-500/20',
  },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            From Zero to{' '}
            <span className="text-gradient">Full Pipeline</span>
            <br />
            in 4 Steps
          </h2>
          <p className="text-lg text-navy-300 max-w-xl mx-auto">
            Aryanka replaces 6 different tools with one seamless workflow.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => {
              const colors = colorMap[step.color];
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="relative text-center"
                >
                  {/* Step number */}
                  <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl ${colors.bg} border ${colors.border} mb-6 shadow-lg ${colors.glow}`}>
                    <step.icon className={`w-7 h-7 ${colors.text}`} />
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-navy-800 border ${colors.border} flex items-center justify-center`}>
                      <span className={`text-xs font-bold ${colors.text}`}>{step.step}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-navy-400 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
