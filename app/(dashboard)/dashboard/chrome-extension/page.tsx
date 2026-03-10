'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Download,
  Bookmark,
  User,
  Zap,
  Star,
  CheckCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

const STEPS = [
  {
    number: 1,
    icon: Globe,
    title: 'Install from Chrome Web Store',
    description:
      'Head to the Chrome Web Store and search for "Aryanka" or click the Download Extension button below. One click to add it to your browser.',
    color: 'from-brand-500 to-indigo-500',
    badge: 'Step 1',
  },
  {
    number: 2,
    icon: Download,
    title: 'Pin to toolbar',
    description:
      'After installing, click the puzzle-piece icon in Chrome\'s toolbar, find Aryanka, and click the pin icon. The Aryanka icon will now be permanently visible for instant access.',
    color: 'from-indigo-500 to-violet-500',
    badge: 'Step 2',
  },
  {
    number: 3,
    icon: Bookmark,
    title: 'Click on any LinkedIn or Twitter profile',
    description:
      'Navigate to any LinkedIn or Twitter/X profile page. The Aryanka extension icon will glow, signaling that enrichment data is ready to capture.',
    color: 'from-violet-500 to-purple-500',
    badge: 'Step 3',
  },
  {
    number: 4,
    icon: Zap,
    title: 'Auto-import lead to CRM',
    description:
      'Click the Aryanka icon and hit "Import Lead". Contact details, company info, and a smart lead score are pulled automatically into your Aryanka CRM — no copy-pasting required.',
    color: 'from-purple-500 to-accent-500',
    badge: 'Step 4',
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'One-click lead capture',
    description: 'Import any social profile into your CRM in a single click.',
  },
  {
    icon: User,
    title: 'Auto-fill LinkedIn data',
    description: 'Name, title, company, email, and phone populated automatically.',
  },
  {
    icon: Globe,
    title: 'LinkedIn profile enrichment',
    description: 'Deep enrichment with company size, industry, and funding data.',
  },
  {
    icon: Star,
    title: 'Smart scoring',
    description: 'AI assigns a lead score instantly based on ICP fit and engagement signals.',
  },
  {
    icon: CheckCircle,
    title: 'Add to sequence',
    description: 'Enrol captured leads into email sequences without leaving the page.',
  },
  {
    icon: ExternalLink,
    title: 'View in CRM',
    description: 'Jump directly to the lead\'s CRM record with a single click.',
  },
];

export default function ChromeExtensionPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="purple" className="text-xs">Browser Extension</Badge>
          <Badge variant="secondary" className="text-xs">Coming Q2 2026</Badge>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Aryanka Chrome Extension</h1>
        <p className="text-navy-400 text-base max-w-2xl">
          Capture leads from LinkedIn and Twitter directly into your CRM — without switching tabs.
          Install the extension once and never manually enter a contact again.
        </p>
      </div>

      {/* Steps */}
      <div className="mb-12">
        <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-6">
          How it works
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-glass rounded-2xl p-6 flex gap-5 group hover:border-brand-500/30 border border-white/5 transition-colors"
              >
                {/* Step badge + icon */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-navy-500 uppercase tracking-widest">
                    Step {step.number}
                  </span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm mb-1.5 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-navy-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Connector hint */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-navy-600">
          <ChevronRight className="w-3 h-3" />
          <span>Takes less than 2 minutes from install to first import</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>

      {/* Key Features */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-6">
          Key features
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-glass border border-white/5 rounded-xl p-5 hover:border-brand-500/20 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-brand-400" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-navy-400 text-xs leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-brand-500/10 via-indigo-500/5 to-accent-500/10 border border-brand-500/20 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-white font-bold text-lg mb-1">Ready to capture leads faster?</h3>
          <p className="text-navy-400 text-sm">
            The extension is currently in development. Join the waitlist to get early access.
          </p>
        </div>
        <div className="flex-shrink-0 group relative">
          <Button
            variant="gradient"
            size="lg"
            disabled
            className="cursor-not-allowed opacity-70 gap-2"
          >
            <Download className="w-4 h-4" />
            Download Extension
          </Button>
          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-navy-800 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
            Coming Q2 2026
          </div>
        </div>
      </div>
    </div>
  );
}
