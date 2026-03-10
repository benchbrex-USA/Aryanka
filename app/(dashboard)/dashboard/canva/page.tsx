'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Palette, ExternalLink, Link2, CheckCircle, ImageIcon, Sparkles } from 'lucide-react';

const TEMPLATES = [
  { name: 'LinkedIn Banner', size: '1584 × 396px', gradient: 'from-blue-600 to-blue-400', category: 'LinkedIn' },
  { name: 'Twitter Post', size: '1600 × 900px', gradient: 'from-sky-500 to-cyan-400', category: 'Twitter' },
  { name: 'Instagram Story', size: '1080 × 1920px', gradient: 'from-pink-500 to-rose-400', category: 'Instagram' },
  { name: 'Email Header', size: '600 × 200px', gradient: 'from-violet-500 to-purple-400', category: 'Email' },
  { name: 'Blog Thumbnail', size: '1200 × 630px', gradient: 'from-purple-600 to-violet-400', category: 'Blog' },
  { name: 'Presentation Slide', size: '1920 × 1080px', gradient: 'from-green-600 to-emerald-400', category: 'Slides' },
];

export default function CanvaPage() {
  const [connected] = useState(false);

  const handleConnect = () => {
    toast({ title: 'Canva integration coming soon!', description: 'We\'re building the Canva OAuth connector. Stay tuned.' });
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Canva Design Studio</h1>
          <p className="text-navy-400 text-sm mt-1">Create stunning visuals for every platform directly from Aryanka</p>
        </div>
        {connected ? (
          <Badge variant="success" className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> Canva Connected
          </Badge>
        ) : (
          <Button variant="gradient" size="sm" onClick={handleConnect}>
            <Link2 className="w-4 h-4" /> Connect Canva
          </Button>
        )}
      </div>

      {!connected && (
        <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-brand-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-white">Connect your Canva account</div>
              <div className="text-xs text-navy-400 mt-0.5">Design platform-perfect visuals and attach them to any post in one click</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleConnect} className="flex-shrink-0">Connect Now</Button>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-white mb-4">Social Media Templates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((tpl) => (
            <div key={tpl.name} className="bg-glass rounded-xl border border-white/10 overflow-hidden hover:border-brand-500/30 transition-all">
              <div className={`h-28 bg-gradient-to-br ${tpl.gradient} flex items-center justify-center`}>
                <ImageIcon className="w-8 h-8 text-white/30" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white text-sm">{tpl.name}</span>
                  <Badge variant="secondary" className="text-xs">{tpl.category}</Badge>
                </div>
                <div className="text-xs text-navy-500 mb-3">{tpl.size}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => window.open('https://www.canva.com/design/new', '_blank')}
                >
                  <ExternalLink className="w-3 h-3" /> Open in Canva
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-glass rounded-xl border border-white/10 p-6">
        <h2 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-400" /> How it works
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            { step: 1, title: 'Connect Canva', desc: 'Link your Canva account via OAuth in one click.' },
            { step: 2, title: 'Pick a Template', desc: 'Choose from Aryanka-branded templates sized for every platform.' },
            { step: 3, title: 'Design & Export', desc: 'Edit in Canva, export, and attach to your posts.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 text-sm font-bold flex items-center justify-center mx-auto mb-3">{step}</div>
              <div className="font-medium text-white text-sm mb-1">{title}</div>
              <div className="text-xs text-navy-400">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
