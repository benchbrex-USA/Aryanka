'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, TrendingUp, Target, Calendar, Loader2, Mail, Phone, Building2, Clock, Star } from 'lucide-react';
import Link from 'next/link';

type Lead = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  source: string;
  status: string;
  score: number;
  notes: string | null;
  created_at: string;
  linkedin_url?: string;
  company_size?: string;
  company_industry?: string;
};

const COLUMNS = [
  { id: 'new', label: 'New', color: 'bg-blue-500', headerBg: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'contacted', label: 'Contacted', color: 'bg-yellow-500', headerBg: 'bg-yellow-500/10 border-yellow-500/20' },
  { id: 'qualified', label: 'Qualified', color: 'bg-accent-500', headerBg: 'bg-accent-500/10 border-accent-500/20' },
  { id: 'proposal', label: 'Proposal', color: 'bg-purple-500', headerBg: 'bg-purple-500/10 border-purple-500/20' },
  { id: 'won', label: 'Won', color: 'bg-green-500', headerBg: 'bg-green-500/10 border-green-500/20' },
  { id: 'lost', label: 'Lost', color: 'bg-red-500', headerBg: 'bg-red-500/10 border-red-500/20' },
];

const SCORE_COLOR = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  return 'text-navy-400';
};

function LeadCard({ lead, isDragging = false }: { lead: Lead; isDragging?: boolean }) {
  const initials = (lead.name || lead.email).slice(0, 2).toUpperCase();
  return (
    <div className={`bg-navy-800/80 rounded-xl p-3.5 border border-white/8 cursor-grab active:cursor-grabbing transition-all ${isDragging ? 'shadow-2xl shadow-brand-500/20 rotate-2 scale-105' : 'hover:border-white/15'}`}>
      <div className="flex items-start gap-2.5 mb-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/40 to-accent-500/40 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white text-sm truncate">{lead.name || 'Anonymous'}</div>
          <div className="text-xs text-navy-400 truncate">{lead.company || lead.email}</div>
        </div>
        <div className={`text-xs font-bold ${SCORE_COLOR(lead.score)}`}>{lead.score}</div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {lead.source && (
          <span className="text-xs bg-white/5 text-navy-400 px-2 py-0.5 rounded-full">{lead.source}</span>
        )}
        {lead.company_industry && (
          <span className="text-xs bg-white/5 text-navy-400 px-2 py-0.5 rounded-full">{lead.company_industry}</span>
        )}
        <span className="text-xs text-navy-600 ml-auto">
          {new Date(lead.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}

function DraggableCard({ lead, onOpen }: { lead: Lead; onOpen: (l: Lead) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id, data: { lead } });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} onClick={() => !isDragging && onOpen(lead)} className={isDragging ? 'opacity-0' : ''}>
      <LeadCard lead={lead} />
    </div>
  );
}

function DroppableColumn({ column, leads, onOpen }: { column: typeof COLUMNS[0]; leads: Lead[]; onOpen: (l: Lead) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div className="flex-shrink-0 w-64">
      <div className={`rounded-xl border p-3 mb-3 ${column.headerBg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${column.color}`} />
            <span className="text-sm font-semibold text-white">{column.label}</span>
          </div>
          <span className="text-xs text-navy-400 bg-white/10 px-2 py-0.5 rounded-full">{leads.length}</span>
        </div>
        {leads.length > 0 && (
          <div className="text-xs text-navy-500 mt-1">
            Avg score: {Math.round(leads.reduce((a, l) => a + l.score, 0) / leads.length)}
          </div>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-[200px] rounded-xl p-2 transition-colors ${isOver ? 'bg-brand-500/5 border border-dashed border-brand-500/30' : ''}`}
      >
        {leads.map((lead) => (
          <DraggableCard key={lead.id} lead={lead} onOpen={onOpen} />
        ))}
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-24 text-navy-700 text-xs text-center">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/leads?limit=200');
    if (res.ok) {
      const d = await res.json();
      setLeads(d.leads || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null;

  const onDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const newStatus = over.id as string;
    const leadId = active.id as string;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;

    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: newStatus } : l));

    const res = await fetch(`/api/leads/${leadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status: lead.status } : l));
      toast({ title: 'Failed to update lead status', variant: 'destructive' });
    } else {
      toast({ title: `Moved to ${newStatus}` });
    }
  };

  const getLeadsForColumn = (status: string) => leads.filter((l) => l.status === status);

  const totalValue = leads.filter((l) => l.status === 'won').length;
  const pipelineLeads = leads.filter((l) => !['won', 'lost'].includes(l.status)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline</h1>
          <p className="text-navy-400 text-sm mt-1">Drag leads between stages</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-navy-400">
              <Target className="w-4 h-4 text-brand-400" />
              <span className="text-white font-medium">{pipelineLeads}</span> in pipeline
            </div>
            <div className="flex items-center gap-2 text-navy-400">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium">{totalValue}</span> won
            </div>
          </div>
          <Link href="/dashboard/leads">
            <Button variant="outline" size="sm"><Users className="w-4 h-4" />Table View</Button>
          </Link>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto">
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex gap-4 pb-4 min-w-max">
            {COLUMNS.map((col) => (
              <DroppableColumn
                key={col.id}
                column={col}
                leads={getLeadsForColumn(col.id)}
                onOpen={setSelectedLead}
              />
            ))}
          </div>
          <DragOverlay>
            {activeLead && <LeadCard lead={activeLead} isDragging />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Lead detail slide-out */}
      <Dialog open={!!selectedLead} onOpenChange={(o) => { if (!o) setSelectedLead(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              {/* Score */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/30 to-accent-500/30 flex items-center justify-center text-white font-bold text-lg">
                  {(selectedLead.name || selectedLead.email).slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white">{selectedLead.name || 'Anonymous'}</div>
                  <div className="text-xs text-navy-400">{selectedLead.email}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className={`text-2xl font-bold ${SCORE_COLOR(selectedLead.score)}`}>{selectedLead.score}</div>
                  <div className="text-xs text-navy-500">score</div>
                </div>
              </div>

              {/* Score bar */}
              <div className="w-full h-2 bg-navy-700 rounded-full">
                <div className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-500" style={{ width: `${selectedLead.score}%` }} />
              </div>

              {/* Details */}
              <div className="space-y-2">
                {selectedLead.company && (
                  <div className="flex items-center gap-2 text-sm text-navy-300">
                    <Building2 className="w-4 h-4 text-navy-500 flex-shrink-0" />
                    {selectedLead.company}
                    {selectedLead.company_size && <span className="text-navy-500">({selectedLead.company_size})</span>}
                  </div>
                )}
                {selectedLead.phone && (
                  <div className="flex items-center gap-2 text-sm text-navy-300">
                    <Phone className="w-4 h-4 text-navy-500 flex-shrink-0" />
                    {selectedLead.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-navy-300">
                  <Mail className="w-4 h-4 text-navy-500 flex-shrink-0" />
                  {selectedLead.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-navy-300">
                  <Star className="w-4 h-4 text-navy-500 flex-shrink-0" />
                  Source: {selectedLead.source}
                </div>
                <div className="flex items-center gap-2 text-sm text-navy-300">
                  <Clock className="w-4 h-4 text-navy-500 flex-shrink-0" />
                  Added {new Date(selectedLead.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {selectedLead.notes && (
                <div className="bg-white/3 rounded-xl p-3 text-sm text-navy-300">
                  <div className="text-xs text-navy-500 mb-1">Notes</div>
                  {selectedLead.notes}
                </div>
              )}

              {/* Status */}
              <div>
                <div className="text-xs text-navy-500 mb-2">Move to stage</div>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.map((col) => (
                    <button
                      key={col.id}
                      onClick={async () => {
                        if (selectedLead.status === col.id) return;
                        setLeads((prev) => prev.map((l) => l.id === selectedLead.id ? { ...l, status: col.id } : l));
                        setSelectedLead((prev) => prev ? { ...prev, status: col.id } : null);
                        await fetch(`/api/leads/${selectedLead.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: col.id }),
                        });
                        toast({ title: `Moved to ${col.label}` });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        selectedLead.status === col.id
                          ? `${col.headerBg} text-white`
                          : 'bg-white/5 border-white/10 text-navy-400 hover:text-white'
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Link href="/dashboard/leads">
                  <Button variant="outline" size="sm">Edit Full Lead</Button>
                </Link>
                <Button variant="gradient" size="sm" onClick={() => setSelectedLead(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
