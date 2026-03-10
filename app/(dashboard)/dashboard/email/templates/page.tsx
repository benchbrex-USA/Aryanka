'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Mail, Plus, Trash2, ArrowUp, ArrowDown, Eye, Copy, Image, Type, AlignLeft, Minus, MousePointerClick, ChevronRight } from 'lucide-react';

type BlockType = 'header_image' | 'headline' | 'body' | 'button' | 'divider' | 'footer';

interface EmailBlock {
  id: string;
  type: BlockType;
  content: string;
  meta?: Record<string, string>;
}

const BLOCK_ICONS: Record<BlockType, React.ElementType> = {
  header_image: Image,
  headline: Type,
  body: AlignLeft,
  button: MousePointerClick,
  divider: Minus,
  footer: AlignLeft,
};

const BLOCK_LABELS: Record<BlockType, string> = {
  header_image: 'Header Image',
  headline: 'Headline',
  body: 'Body Text',
  button: 'CTA Button',
  divider: 'Divider',
  footer: 'Footer',
};

const DEFAULT_TEMPLATES: Array<{ name: string; description: string; category: string; blocks: EmailBlock[] }> = [
  {
    name: 'Welcome Email',
    description: 'First email after signup',
    category: 'Onboarding',
    blocks: [
      { id: '1', type: 'headline', content: 'Welcome to {{product_name}}, {{first_name}}! 👋' },
      { id: '2', type: 'body', content: "We're thrilled to have you on board. Here's what you can do next:\n\n• Complete your profile\n• Connect your social accounts\n• Create your first post\n\nIf you have any questions, just reply to this email." },
      { id: '3', type: 'button', content: 'Get Started →', meta: { url: '{{app_url}}/dashboard', color: '#3B82F6' } },
      { id: '4', type: 'divider', content: '' },
      { id: '5', type: 'footer', content: 'You received this because you signed up for {{product_name}}. Unsubscribe anytime.' },
    ],
  },
  {
    name: 'Cold Outreach',
    description: 'First touch cold email',
    category: 'Outbound',
    blocks: [
      { id: '1', type: 'headline', content: 'Quick question about {{company}}' },
      { id: '2', type: 'body', content: "Hi {{first_name}},\n\nI came across {{company}} and noticed you're focused on growth.\n\nWe help companies like yours [key benefit] — typically seeing [metric] within [timeframe].\n\nWould it be worth a 15-min call this week to see if it's a fit?\n\nBest,\n{{sender_name}}" },
      { id: '3', type: 'button', content: 'Book a 15-min call', meta: { url: '{{calendar_url}}', color: '#10B981' } },
    ],
  },
  {
    name: 'Newsletter',
    description: 'Weekly newsletter format',
    category: 'Content',
    blocks: [
      { id: '1', type: 'header_image', content: '{{newsletter_banner_url}}' },
      { id: '2', type: 'headline', content: '{{newsletter_title}}' },
      { id: '3', type: 'body', content: "This week in {{topic}}:\n\n**📌 Main Story**\n{{main_story}}\n\n**💡 Quick Tip**\n{{quick_tip}}\n\n**🔗 Worth Reading**\n{{links}}" },
      { id: '4', type: 'divider', content: '' },
      { id: '5', type: 'footer', content: 'Thanks for reading! Forward to a friend who would enjoy this.' },
    ],
  },
  {
    name: 'Follow-Up',
    description: '3-day follow up after no reply',
    category: 'Outbound',
    blocks: [
      { id: '1', type: 'headline', content: 'Following up — {{company}}' },
      { id: '2', type: 'body', content: "Hi {{first_name}},\n\nJust circling back on my last email. I know inboxes get busy.\n\nIn case it's helpful, here's a quick [case study / resource] showing how we helped [similar company].\n\nStill worth a quick chat?\n\n{{sender_name}}" },
    ],
  },
  {
    name: 'Product Update',
    description: 'Announce new features',
    category: 'Marketing',
    blocks: [
      { id: '1', type: 'header_image', content: '{{feature_image_url}}' },
      { id: '2', type: 'headline', content: "🚀 New: {{feature_name}}" },
      { id: '3', type: 'body', content: "Hi {{first_name}},\n\nWe just launched {{feature_name}} — here's what it means for you:\n\n{{feature_description}}\n\nThis is now live in your account. Give it a try!" },
      { id: '4', type: 'button', content: 'Try It Now', meta: { url: '{{feature_url}}', color: '#3B82F6' } },
      { id: '5', type: 'footer', content: '{{product_name}} · Unsubscribe' },
    ],
  },
  {
    name: 'Demo Confirmation',
    description: 'Sent after demo is booked',
    category: 'Sales',
    blocks: [
      { id: '1', type: 'headline', content: "✅ Demo confirmed, {{first_name}}!" },
      { id: '2', type: 'body', content: "Your demo is booked for {{demo_date}} at {{demo_time}}.\n\nTo make the most of our time:\n1. Think about your biggest challenge with [problem area]\n2. Have your team ready if relevant\n3. We'll share our screen — no prep needed from your side\n\nSee you then!\n{{sender_name}}" },
      { id: '3', type: 'button', content: 'Add to Calendar', meta: { url: '{{calendar_link}}', color: '#10B981' } },
    ],
  },
  {
    name: 'Re-engagement',
    description: 'Win back inactive users',
    category: 'Retention',
    blocks: [
      { id: '1', type: 'headline', content: "We miss you, {{first_name}} 👋" },
      { id: '2', type: 'body', content: "Hi {{first_name}},\n\nWe noticed you haven't logged into {{product_name}} in a while.\n\nHere's what's new since you last visited:\n• {{update_1}}\n• {{update_2}}\n• {{update_3}}\n\nWant to give us another shot?" },
      { id: '3', type: 'button', content: 'Come Back', meta: { url: '{{login_url}}', color: '#F97316' } },
      { id: '4', type: 'body', content: 'If you want to unsubscribe, no hard feelings — just click below.' },
    ],
  },
  {
    name: 'Referral',
    description: 'Encourage referrals',
    category: 'Growth',
    blocks: [
      { id: '1', type: 'headline', content: 'Earn rewards for sharing {{product_name}} 🎁' },
      { id: '2', type: 'body', content: "Hi {{first_name}},\n\nLove using {{product_name}}? Share it with a friend and you'll both get rewarded:\n\n• You get: {{referrer_reward}}\n• Your friend gets: {{referee_reward}}\n\nYour unique referral link:" },
      { id: '3', type: 'body', content: '{{referral_link}}' },
      { id: '4', type: 'button', content: 'Share Your Link', meta: { url: '{{referral_link}}', color: '#A855F7' } },
    ],
  },
  {
    name: 'Upsell',
    description: 'Upgrade to paid plan',
    category: 'Sales',
    blocks: [
      { id: '1', type: 'headline', content: "You're getting close to your limit, {{first_name}}" },
      { id: '2', type: 'body', content: "Hi {{first_name}},\n\nYou've used {{usage_percent}}% of your {{plan_name}} plan this month.\n\nUpgrade to {{upgrade_plan}} to get:\n• {{benefit_1}}\n• {{benefit_2}}\n• {{benefit_3}}\n\nFirst month at 20% off — offer expires in {{days_left}} days." },
      { id: '3', type: 'button', content: 'Upgrade Now — 20% Off', meta: { url: '{{upgrade_url}}', color: '#EAB308' } },
    ],
  },
  {
    name: 'Goodbye',
    description: 'Cancellation / churn',
    category: 'Retention',
    blocks: [
      { id: '1', type: 'headline', content: "We're sad to see you go, {{first_name}}" },
      { id: '2', type: 'body', content: "Hi {{first_name}},\n\nYour {{product_name}} account has been cancelled as requested.\n\nBefore you go — we'd love to know why:\n\n[ ] Too expensive\n[ ] Missing features\n[ ] Found a better alternative\n[ ] Not using it enough\n\nReply to this email with your thoughts — your feedback helps us improve.\n\nIf you ever want to come back, your data will be here for 30 days.\n\n— The {{product_name}} Team" },
    ],
  },
];

function renderBlockPreview(block: EmailBlock): string {
  switch (block.type) {
    case 'header_image':
      return `<div style="background:#1a1a2e;padding:24px;text-align:center;border-radius:8px 8px 0 0"><div style="background:#2a2a4a;border-radius:6px;height:120px;display:flex;align-items:center;justify-content:center;color:#666">📸 Header Image</div></div>`;
    case 'headline':
      return `<h2 style="font-size:22px;font-weight:700;color:#fff;margin:20px 0 12px;font-family:sans-serif">${block.content}</h2>`;
    case 'body':
      return `<p style="font-size:15px;line-height:1.7;color:#aaa;margin:0 0 16px;white-space:pre-wrap;font-family:sans-serif">${block.content}</p>`;
    case 'button':
      return `<div style="text-align:center;margin:20px 0"><a href="#" style="display:inline-block;background:${block.meta?.color || '#3B82F6'};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-family:sans-serif">${block.content}</a></div>`;
    case 'divider':
      return `<hr style="border:none;border-top:1px solid #2a2a3e;margin:20px 0">`;
    case 'footer':
      return `<p style="font-size:12px;color:#555;text-align:center;margin:16px 0;font-family:sans-serif">${block.content}</p>`;
    default:
      return '';
  }
}

function blocksToHTML(blocks: EmailBlock[]): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0f0f1a;font-family:sans-serif">
<div style="max-width:600px;margin:0 auto;background:#12121e;border-radius:12px;overflow:hidden;border:1px solid #2a2a3e">
<div style="padding:24px 32px">
${blocks.map(renderBlockPreview).join('\n')}
</div></div></body></html>`;
}

function newBlock(type: BlockType): EmailBlock {
  return { id: Math.random().toString(36).slice(2), type, content: '', meta: {} };
}

export default function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof DEFAULT_TEMPLATES)[0] | null>(null);
  const [editBlocks, setEditBlocks] = useState<EmailBlock[]>([]);
  const [editName, setEditName] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const openTemplate = (template: typeof DEFAULT_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setEditBlocks(template.blocks.map((b) => ({ ...b, id: Math.random().toString(36).slice(2) })));
    setEditName(template.name);
  };

  const addBlock = (type: BlockType) => {
    setEditBlocks((prev) => [...prev, newBlock(type)]);
  };

  const removeBlock = (id: string) => {
    setEditBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (id: string, dir: 'up' | 'down') => {
    setEditBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      if (i < 0) return prev;
      const next = [...prev];
      const swapIdx = dir === 'up' ? i - 1 : i + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[i], next[swapIdx]] = [next[swapIdx], next[i]];
      return next;
    });
  };

  const updateBlock = (id: string, content: string) => {
    setEditBlocks((prev) => prev.map((b) => b.id === id ? { ...b, content } : b));
  };

  const copyHTML = () => {
    const html = blocksToHTML(editBlocks);
    navigator.clipboard.writeText(html);
    toast({ title: 'HTML copied to clipboard!' });
  };

  const useInCampaign = () => {
    // Store template in sessionStorage for the email campaign creator to pick up
    sessionStorage.setItem('email_template', JSON.stringify({ name: editName, blocks: editBlocks, html: blocksToHTML(editBlocks) }));
    toast({ title: 'Template ready!', description: 'Go to Email Campaigns to use it.' });
  };

  const categories = Array.from(new Set(DEFAULT_TEMPLATES.map((t) => t.category)));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Templates</h1>
          <p className="text-navy-400 text-sm mt-1">10 pre-built templates with a visual block editor</p>
        </div>
        {selectedTemplate && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}><Eye className="w-4 h-4" />Preview</Button>
            <Button variant="outline" size="sm" onClick={copyHTML}><Copy className="w-4 h-4" />Copy HTML</Button>
            <Button variant="gradient" size="sm" onClick={useInCampaign}>Use in Campaign</Button>
          </div>
        )}
      </div>

      {!selectedTemplate ? (
        <>
          {categories.map((cat) => (
            <div key={cat} className="mb-8">
              <h2 className="text-sm font-semibold text-navy-400 uppercase tracking-wider mb-3">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEFAULT_TEMPLATES.filter((t) => t.category === cat).map((template) => (
                  <button
                    key={template.name}
                    onClick={() => openTemplate(template)}
                    className="bg-glass rounded-xl p-5 text-left hover:border-brand-500/40 border border-white/10 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3">
                      <Mail className="w-5 h-5 text-brand-400" />
                    </div>
                    <div className="font-semibold text-white text-sm mb-1">{template.name}</div>
                    <div className="text-xs text-navy-400 mb-3">{template.description}</div>
                    <div className="text-xs text-brand-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Open editor <ChevronRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Block editor */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedTemplate(null)} className="text-xs text-navy-400 hover:text-white transition-colors">← All Templates</button>
                <h2 className="font-semibold text-white">{editName}</h2>
              </div>
              <div className="flex gap-1">
                {(['header_image', 'headline', 'body', 'button', 'divider', 'footer'] as BlockType[]).map((type) => {
                  const Icon = BLOCK_ICONS[type];
                  return (
                    <button
                      key={type}
                      onClick={() => addBlock(type)}
                      title={`Add ${BLOCK_LABELS[type]}`}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-navy-400 hover:text-white transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
                <button onClick={() => addBlock('body')} className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-navy-400 hover:text-white transition-colors text-xs flex items-center gap-1">
                  <Plus className="w-3 h-3" />Block
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {editBlocks.map((block, i) => {
                const Icon = BLOCK_ICONS[block.type];
                return (
                  <div key={block.id} className="bg-glass rounded-xl border border-white/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-3.5 h-3.5 text-navy-500" />
                      <span className="text-xs font-medium text-navy-400">{BLOCK_LABELS[block.type]}</span>
                      <div className="ml-auto flex items-center gap-1">
                        <button onClick={() => moveBlock(block.id, 'up')} disabled={i === 0} className="p-1 text-navy-600 hover:text-white disabled:opacity-30 transition-colors">
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button onClick={() => moveBlock(block.id, 'down')} disabled={i === editBlocks.length - 1} className="p-1 text-navy-600 hover:text-white disabled:opacity-30 transition-colors">
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button onClick={() => removeBlock(block.id)} className="p-1 text-navy-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    {block.type !== 'divider' && (
                      block.type === 'body' || block.type === 'footer' ? (
                        <Textarea
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                          rows={4}
                          className="text-xs resize-none"
                        />
                      ) : (
                        <Input
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, e.target.value)}
                          className="text-xs"
                          placeholder={block.type === 'button' ? 'Button text' : block.type === 'header_image' ? 'Image URL' : 'Content'}
                        />
                      )
                    )}
                  </div>
                );
              })}
            </div>

            {/* Merge tags */}
            <div className="mt-4 p-3 bg-white/3 rounded-xl border border-white/5">
              <p className="text-xs text-navy-500 mb-2">Available merge tags:</p>
              <div className="flex flex-wrap gap-1.5">
                {['{{first_name}}', '{{company}}', '{{email}}', '{{lead_score}}', '{{product_name}}', '{{sender_name}}'].map((tag) => (
                  <code key={tag} className="text-xs bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded cursor-pointer hover:bg-brand-500/20 transition-colors" onClick={() => navigator.clipboard.writeText(tag)}>
                    {tag}
                  </code>
                ))}
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div>
            <h2 className="font-semibold text-white text-sm mb-3">Live Preview</h2>
            <div className="bg-black rounded-xl overflow-hidden border border-white/10" style={{ minHeight: '400px' }}>
              <iframe
                srcDoc={blocksToHTML(editBlocks)}
                className="w-full border-none"
                style={{ height: '600px' }}
                title="Email Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Full preview modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader><DialogTitle>Email Preview — {editName}</DialogTitle></DialogHeader>
          <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
            <iframe srcDoc={blocksToHTML(editBlocks)} className="w-full border-none rounded-xl" style={{ height: '600px' }} title="Full Preview" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button variant="gradient" onClick={copyHTML}><Copy className="w-4 h-4" />Copy HTML</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
