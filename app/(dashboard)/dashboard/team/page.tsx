'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { UserPlus, Users, Trash2, Loader2, Mail, Copy, CheckCircle, Shield, Eye } from 'lucide-react';

interface Member {
  id: string;
  invited_email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'pending' | 'accepted' | 'declined';
  invited_at: string;
  accepted_at?: string;
  invite_token?: string;
  workspaces?: { name: string; owner_id: string };
}

interface Workspace {
  id: string;
  name: string;
}

const ROLE_META: Record<string, { label: string; color: string; icon: React.ElementType; desc: string }> = {
  owner:  { label: 'Owner',  color: 'text-yellow-400',  icon: Shield, desc: 'Full access, billing, delete workspace' },
  admin:  { label: 'Admin',  color: 'text-brand-400',   icon: Shield, desc: 'Manage leads, content, team members' },
  member: { label: 'Member', color: 'text-accent-400',  icon: Users,  desc: 'Create & edit leads, content, analytics' },
  viewer: { label: 'Viewer', color: 'text-navy-400',    icon: Eye,    desc: 'Read-only access to dashboard' },
};

export default function TeamPage() {
  type InviteRole = 'admin' | 'member' | 'viewer';
  interface InviteForm { email: string; role: InviteRole; workspace_id: string; }
  const [members, setMembers] = useState<Member[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<InviteForm>({ email: '', role: 'member', workspace_id: '' });
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [membersRes, workspacesRes] = await Promise.all([
      fetch('/api/team'),
      fetch('/api/workspaces'),
    ]);
    if (membersRes.ok) {
      const { members: m } = await membersRes.json();
      setMembers(m || []);
    }
    if (workspacesRes.ok) {
      const { workspaces: w } = await workspacesRes.json();
      setWorkspaces(w || []);
      if (w?.[0]) setForm((f) => ({ ...f, workspace_id: w[0].id }));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.workspace_id) {
      toast({ title: 'Create a workspace first', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast({ title: 'Invite sent!', description: `Invitation sent to ${form.email}` });
      setOpen(false);
      setForm((f) => ({ ...f, email: '' }));
      fetchData();
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this team member?')) return;
    const res = await fetch('/api/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ member_id: id }),
    });
    if (res.ok) { toast({ title: 'Member removed' }); fetchData(); }
  };

  const copyInviteLink = async (token: string) => {
    const link = `${window.location.origin}/invite?token=${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Collaboration</h1>
          <p className="text-navy-400 text-sm mt-1">Invite team members and assign roles</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setOpen(true)}>
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      {/* Role guide */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {Object.entries(ROLE_META).filter(([r]) => r !== 'owner').map(([role, meta]) => {
          const Icon = meta.icon;
          return (
            <div key={role} className="bg-glass rounded-xl p-3 border border-white/10">
              <Icon className={`w-4 h-4 ${meta.color} mb-1.5`} />
              <div className="text-xs font-medium text-white">{meta.label}</div>
              <div className="text-xs text-navy-500 mt-0.5">{meta.desc}</div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-brand-400" /></div>
      ) : members.length === 0 ? (
        <div className="bg-glass rounded-xl p-12 text-center border border-white/10">
          <Users className="w-10 h-10 text-navy-500 mx-auto mb-3" />
          <p className="text-navy-400 text-sm mb-4">No team members yet. Invite your first team member.</p>
          <Button variant="gradient" size="sm" onClick={() => setOpen(true)}><UserPlus className="w-4 h-4" />Invite Now</Button>
        </div>
      ) : (
        <div className="bg-glass rounded-xl overflow-hidden border border-white/10">
          <div className="p-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">{members.length} Member{members.length !== 1 ? 's' : ''}</h2>
          </div>
          <div className="divide-y divide-white/5">
            {members.map((m) => {
              const meta = ROLE_META[m.role];
              const Icon = meta.icon;
              return (
                <div key={m.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {m.invited_email.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{m.invited_email}</div>
                    <div className="text-xs text-navy-500">
                      Invited {new Date(m.invited_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={`flex items-center gap-1 text-xs ${meta.color}`}>
                      <Icon className="w-3 h-3" />
                      {meta.label}
                    </div>
                    <Badge variant={m.status === 'accepted' ? 'success' : m.status === 'declined' ? 'destructive' : 'secondary'} className="text-xs">
                      {m.status}
                    </Badge>
                    {m.status === 'pending' && m.invite_token && (
                      <button
                        onClick={() => copyInviteLink(m.invite_token!)}
                        title="Copy invite link"
                        className="p-1.5 rounded-lg text-navy-500 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {copiedToken === m.invite_token ? <CheckCircle className="w-4 h-4 text-accent-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                    <button onClick={() => handleRemove(m.id)} className="p-1.5 rounded-lg text-navy-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4">
            {workspaces.length === 0 ? (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-yellow-400">
                You need to create a workspace first before inviting team members.
              </div>
            ) : (
              <>
                <div>
                  <Label>Workspace</Label>
                  <select
                    className="mt-1 w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    value={form.workspace_id}
                    onChange={(e) => setForm((f) => ({ ...f, workspace_id: e.target.value }))}
                  >
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>{ws.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="colleague@company.com"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <select
                    className="mt-1 w-full bg-navy-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as InviteRole }))}
                  >
                    <option value="admin">Admin — Full management access</option>
                    <option value="member">Member — Create & edit content</option>
                    <option value="viewer">Viewer — Read-only access</option>
                  </select>
                </div>
              </>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              {workspaces.length > 0 && (
                <Button type="submit" variant="gradient" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send Invite
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
