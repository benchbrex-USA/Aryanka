import { generateMetadata } from '@/lib/seo/metadata';
import { Search, Filter, Download, Plus, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = generateMetadata({ title: 'Leads & CRM', noIndex: true });

const leads = [
  { id: '1', name: 'Rahul Mehta', company: 'TechFlow Inc', email: 'rahul@techflow.com', phone: '+91 98765 43210', score: 85, status: 'qualified', source: 'LinkedIn', created: '2024-01-15' },
  { id: '2', name: 'Priya Sharma', company: 'DataPilot SaaS', email: 'priya@datapilot.io', phone: '+91 87654 32109', score: 92, status: 'demo', source: 'Google', created: '2024-01-14' },
  { id: '3', name: 'Vikram Patel', company: 'CloudOps Pro', email: 'vikram@cloudops.pro', phone: '+91 76543 21098', score: 71, status: 'new', source: 'Reddit', created: '2024-01-14' },
  { id: '4', name: 'Anjali Kumar', company: 'SalesRocket', email: 'anjali@salesrocket.co', phone: '+91 65432 10987', score: 88, status: 'qualified', source: 'Blog', created: '2024-01-13' },
  { id: '5', name: 'Karan Singh', company: 'Nimbly', email: 'karan@nimbly.app', phone: '+91 54321 09876', score: 65, status: 'contacted', source: 'Twitter', created: '2024-01-13' },
  { id: '6', name: 'Sneha Iyer', company: 'Infrastack', email: 'sneha@infrastack.io', phone: '+91 43210 98765', score: 78, status: 'proposal', source: 'LinkedIn', created: '2024-01-12' },
  { id: '7', name: 'Dev Kapoor', company: 'RocketFuel AI', email: 'dev@rocketfuel.ai', phone: '+91 32109 87654', score: 95, status: 'won', source: 'Demo', created: '2024-01-11' },
];

const statusConfig: Record<string, { color: string; label: string }> = {
  new: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/20', label: 'New' },
  contacted: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20', label: 'Contacted' },
  qualified: { color: 'bg-accent-500/20 text-accent-400 border-accent-500/20', label: 'Qualified' },
  demo: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/20', label: 'Demo' },
  proposal: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/20', label: 'Proposal' },
  won: { color: 'bg-green-500/20 text-green-400 border-green-500/20', label: 'Won' },
  lost: { color: 'bg-red-500/20 text-red-400 border-red-500/20', label: 'Lost' },
};

const pipeline = [
  { stage: 'New', count: 124, value: '₹12.4L' },
  { stage: 'Contacted', count: 87, value: '₹34.8L' },
  { stage: 'Qualified', count: 43, value: '₹86L' },
  { stage: 'Demo', count: 21, value: '₹1.05Cr' },
  { stage: 'Proposal', count: 11, value: '₹1.98Cr' },
  { stage: 'Won', count: 7, value: '₹2.8Cr' },
];

export default function LeadsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads & CRM</h1>
          <p className="text-navy-400 mt-1">1,247 total leads in your pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button variant="gradient" size="sm">
            <Plus className="w-4 h-4" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Pipeline overview */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        {pipeline.map((stage) => (
          <div key={stage.stage} className="bg-glass rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stage.count}</div>
            <div className="text-xs text-navy-400 mt-0.5">{stage.stage}</div>
            <div className="text-xs text-accent-400 mt-1 font-medium">{stage.value}</div>
          </div>
        ))}
      </div>

      {/* Search and filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" />
          <input
            type="text"
            placeholder="Search leads..."
            className="w-full h-10 pl-9 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Leads table */}
      <div className="bg-glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Lead', 'Company', 'Source', 'Score', 'Status', 'Date', ''].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.map((lead) => {
                const s = statusConfig[lead.status];
                return (
                  <tr key={lead.id} className="hover:bg-white/3 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="font-medium text-white text-sm">{lead.name}</div>
                      <div className="text-xs text-navy-500">{lead.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-navy-300">{lead.company}</div>
                      <div className="text-xs text-navy-500">{lead.phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-navy-300">{lead.source}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-navy-700 rounded-full">
                          <div className="h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-500" style={{ width: `${lead.score}%` }} />
                        </div>
                        <span className="text-xs font-bold text-white">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${s?.color}`}>
                        {s?.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-navy-500">{lead.created}</td>
                    <td className="px-5 py-4">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10">
                        <ArrowUpRight className="w-4 h-4 text-navy-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
