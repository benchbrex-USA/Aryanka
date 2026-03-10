'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Inbox, CheckCircle, XCircle, Send, Bot, Loader2, Mail, Star, Archive } from 'lucide-react';

interface InboxReply {
  id: string;
  lead_email: string;
  lead_name: string;
  lead_company: string;
  campaign_name: string;
  reply_body: string;
  classification: 'interested' | 'not_interested' | 'auto_reply' | 'question' | 'unclassified';
  ai_suggested_reply: string | null;
  received_at: string;
  status: 'pending' | 'replied' | 'archived';
}

const CLASSIFICATION_META: Record<string, { label: string; variant: 'success' | 'destructive' | 'secondary' | 'warning'; emoji: string }> = {
  interested: { label: 'Interested', variant: 'success', emoji: '🔥' },
  not_interested: { label: 'Not Interested', variant: 'destructive', emoji: '❌' },
  auto_reply: { label: 'Auto Reply', variant: 'secondary', emoji: '🤖' },
  question: { label: 'Has Question', variant: 'warning', emoji: '❓' },
  unclassified: { label: 'Unclassified', variant: 'secondary', emoji: '📬' },
};

// Mock data for demo — real data would come from /api/inbox
const MOCK_REPLIES: InboxReply[] = [
  {
    id: '1',
    lead_email: 'sarah@techcorp.io',
    lead_name: 'Sarah Chen',
    lead_company: 'TechCorp',
    campaign_name: 'Q1 Outbound',
    reply_body: "Hey! This actually looks really interesting. We've been struggling with our content distribution workflow. Can we hop on a quick call this week?",
    classification: 'interested',
    ai_suggested_reply: "Hi Sarah! Great to hear from you — I'd love to show you how Aryanka handles content distribution end-to-end.\n\nHow does Thursday at 2pm or Friday at 10am work for a 20-min call?\n\nLooking forward to it!",
    received_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: '2',
    lead_email: 'mark@saasbuilder.co',
    lead_name: 'Mark Rodriguez',
    lead_company: 'SaaS Builder',
    campaign_name: 'Q1 Outbound',
    reply_body: "Thanks but we're happy with our current setup. Please remove me from your list.",
    classification: 'not_interested',
    ai_suggested_reply: "Hi Mark, absolutely — I'll remove you right away. No hard feelings! If your situation changes down the road, feel free to reach out. Best of luck with SaaS Builder!",
    received_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: '3',
    lead_email: 'no-reply@mailservice.com',
    lead_name: 'Auto Responder',
    lead_company: '',
    campaign_name: 'Welcome Nurture',
    reply_body: "I am out of office until March 15th. For urgent matters, contact team@company.com",
    classification: 'auto_reply',
    ai_suggested_reply: null,
    received_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
  {
    id: '4',
    lead_email: 'priya@growthco.in',
    lead_name: 'Priya Sharma',
    lead_company: 'GrowthCo',
    campaign_name: 'Agency Pitch',
    reply_body: "How does your pricing work for agencies managing multiple clients? And do you have a white-label option?",
    classification: 'question',
    ai_suggested_reply: "Hi Priya! Great questions.\n\nFor agencies, we have a dedicated Agency plan that includes:\n• Unlimited client workspaces\n• White-label (your logo, your domain)\n• Client-facing read-only dashboards\n• Bulk seat pricing\n\nPricing starts at $299/month for up to 10 clients. Would you like to see a quick demo tailored for agencies?\n\nHappy to walk you through it — usually takes 20 min.",
    received_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  },
];

export default function InboxPage() {
  const [replies, setReplies] = useState<InboxReply[]>(MOCK_REPLIES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [sending, setSending] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const openEdit = (reply: InboxReply) => {
    setEditingId(reply.id);
    setEditText(reply.ai_suggested_reply || '');
  };

  const handleSend = async (reply: InboxReply) => {
    setSending(reply.id);
    await new Promise((r) => setTimeout(r, 1000)); // Simulate API call
    setReplies((prev) => prev.map((r) => r.id === reply.id ? { ...r, status: 'replied' } : r));
    setEditingId(null);
    setSending(null);
    toast({ title: `✅ Reply sent to ${reply.lead_name}!` });
  };

  const handleArchive = (id: string) => {
    setReplies((prev) => prev.map((r) => r.id === id ? { ...r, status: 'archived' } : r));
    toast({ title: 'Archived' });
  };

  const filtered = replies.filter((r) => {
    if (filter === 'all') return r.status === 'pending';
    if (filter === 'interested') return r.classification === 'interested';
    if (filter === 'replied') return r.status === 'replied';
    return true;
  });

  const interestedCount = replies.filter((r) => r.classification === 'interested' && r.status === 'pending').length;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Reply Agent</h1>
          <p className="text-navy-400 text-sm mt-1">Email replies are classified and AI drafts responses in seconds</p>
        </div>
        <div className="flex items-center gap-2">
          {interestedCount > 0 && (
            <Badge variant="success" className="animate-pulse">{interestedCount} interested 🔥</Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Pending', value: replies.filter((r) => r.status === 'pending').length, color: 'text-white' },
          { label: 'Interested', value: replies.filter((r) => r.classification === 'interested').length, color: 'text-green-400' },
          { label: 'Questions', value: replies.filter((r) => r.classification === 'question').length, color: 'text-yellow-400' },
          { label: 'Replied', value: replies.filter((r) => r.status === 'replied').length, color: 'text-navy-400' },
        ].map((s) => (
          <div key={s.label} className="bg-glass rounded-xl p-4">
            <div className="text-xs text-navy-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { value: 'all', label: 'All Pending' },
          { value: 'interested', label: '🔥 Interested' },
          { value: 'replied', label: 'Replied' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f.value ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-white/5 text-navy-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-glass rounded-xl p-12 text-center">
          <Inbox className="w-10 h-10 text-navy-600 mx-auto mb-3" />
          <p className="text-navy-400 text-sm">No replies to show. Your AI inbox will populate as leads reply to your campaigns.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((reply) => {
            const meta = CLASSIFICATION_META[reply.classification];
            return (
              <div key={reply.id} className={`bg-glass rounded-xl border p-5 ${
                reply.classification === 'interested' ? 'border-green-500/30' :
                reply.classification === 'question' ? 'border-yellow-500/20' :
                'border-white/10'
              }`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{reply.lead_name}</span>
                      {reply.lead_company && <span className="text-xs text-navy-400">at {reply.lead_company}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-navy-500">
                      <Mail className="w-3 h-3" />
                      {reply.lead_email}
                      <span>·</span>
                      {reply.campaign_name}
                      <span>·</span>
                      {new Date(reply.received_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{meta.emoji}</span>
                    <Badge variant={meta.variant} className="text-xs">{meta.label}</Badge>
                  </div>
                </div>

                {/* Their reply */}
                <div className="bg-navy-800/50 rounded-xl p-3 mb-3 text-sm text-navy-200">
                  {reply.reply_body}
                </div>

                {/* AI suggested reply */}
                {reply.ai_suggested_reply && reply.status === 'pending' && (
                  <div className="border border-brand-500/20 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-brand-400" />
                      <span className="text-xs font-medium text-brand-400">AI Suggested Reply</span>
                    </div>
                    {editingId === reply.id ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    ) : (
                      <p className="text-sm text-navy-200 whitespace-pre-wrap">{reply.ai_suggested_reply}</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                {reply.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    {reply.ai_suggested_reply && (
                      <>
                        {editingId === reply.id ? (
                          <>
                            <Button variant="gradient" size="sm" onClick={() => handleSend(reply)} disabled={sending === reply.id}>
                              {sending === reply.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              Send
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <Button variant="gradient" size="sm" onClick={() => openEdit(reply)}>
                              <Send className="w-4 h-4" /> Send Reply
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openEdit(reply)}>Edit</Button>
                          </>
                        )}
                      </>
                    )}
                    {reply.classification === 'interested' && (
                      <Button variant="outline" size="sm" className="border-green-500/30 text-green-400">
                        <Star className="w-3.5 h-3.5" /> Mark as Hot Lead
                      </Button>
                    )}
                    <button onClick={() => handleArchive(reply.id)} className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-navy-400 hover:text-white transition-colors">
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {reply.status === 'replied' && (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle className="w-4 h-4" /> Replied
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
