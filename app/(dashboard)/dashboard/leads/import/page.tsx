'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Upload, FileText, CheckCircle, XCircle, Loader2, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface MappedColumn {
  csvCol: string;
  field: string;
}

const LEAD_FIELDS = [
  { value: '', label: '— Skip —' },
  { value: 'email', label: 'Email *' },
  { value: 'name', label: 'Full Name' },
  { value: 'company', label: 'Company' },
  { value: 'phone', label: 'Phone' },
  { value: 'source', label: 'Source' },
  { value: 'status', label: 'Status' },
  { value: 'notes', label: 'Notes' },
  { value: 'linkedin_url', label: 'LinkedIn URL' },
  { value: 'company_industry', label: 'Industry' },
  { value: 'company_size', label: 'Company Size' },
];

// Auto-detect common column name patterns
function autoMap(headers: string[]): MappedColumn[] {
  const PATTERNS: Record<string, string[]> = {
    email: ['email', 'e-mail', 'email address', 'work email'],
    name: ['name', 'full name', 'contact name', 'first name', 'person name'],
    company: ['company', 'organization', 'org', 'company name', 'employer', 'account'],
    phone: ['phone', 'mobile', 'tel', 'telephone', 'cell'],
    source: ['source', 'lead source', 'channel'],
    status: ['status', 'stage', 'lead status'],
    notes: ['notes', 'note', 'comments', 'description'],
    linkedin_url: ['linkedin', 'linkedin url', 'profile url', 'linkedin profile'],
    company_industry: ['industry', 'vertical', 'sector'],
    company_size: ['company size', 'employees', 'headcount', 'size'],
  };

  return headers.map((col) => {
    const lower = col.toLowerCase().trim();
    let matched = '';
    for (const [field, patterns] of Object.entries(PATTERNS)) {
      if (patterns.includes(lower)) { matched = field; break; }
    }
    return { csvCol: col, field: matched };
  });
}

interface ImportResult {
  imported: number;
  duplicates: number;
  errors: number;
  error_rows: Array<{ row: number; email: string; error: string }>;
}

export default function ImportPage() {
  const [step, setStep] = useState<'upload' | 'map' | 'importing' | 'done'>('upload');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<MappedColumn[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): { headers: string[]; rows: string[][] } => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
    const rows = lines.slice(1).map((line) => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
        else current += char;
      }
      values.push(current.trim());
      return values;
    });
    return { headers, rows };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { headers, rows } = parseCSV(text);
      setCsvHeaders(headers);
      setCsvRows(rows);
      setMapping(autoMap(headers));
      setStep('map');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith('.csv')) {
      toast({ title: 'Please drop a CSV file', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { headers, rows } = parseCSV(text);
      setCsvHeaders(headers);
      setCsvRows(rows);
      setMapping(autoMap(headers));
      setStep('map');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setStep('importing');
    setProgress(0);

    const emailColIdx = mapping.findIndex((m) => m.field === 'email');
    if (emailColIdx < 0) {
      toast({ title: 'Email column is required', variant: 'destructive' });
      setStep('map');
      return;
    }

    const BATCH_SIZE = 25;
    let imported = 0, duplicates = 0, errors = 0;
    const errorRows: ImportResult['error_rows'] = [];

    for (let i = 0; i < csvRows.length; i += BATCH_SIZE) {
      const batch = csvRows.slice(i, i + BATCH_SIZE);
      const leads = batch.map((row, batchIdx) => {
        const lead: Record<string, string> = {};
        mapping.forEach((m, colIdx) => {
          if (m.field && row[colIdx] !== undefined) {
            lead[m.field] = row[colIdx].replace(/^"|"$/g, '').trim();
          }
        });
        return { ...lead, _rowNum: i + batchIdx + 2 } as Record<string, string | number>;
      }).filter((l) => !!(l as Record<string, unknown>).email);

      for (const lead of leads) {
        try {
          const res = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...lead, source: lead.source || 'import', type: 'signup' }),
          });
          if (res.status === 409 || res.status === 200) duplicates++;
          else if (res.ok) imported++;
          else {
            errors++;
            const d = await res.json().catch(() => ({}));
            errorRows.push({ row: lead._rowNum as number, email: String(lead.email || ''), error: d.error || 'Unknown error' });
          }
        } catch {
          errors++;
          errorRows.push({ row: lead._rowNum as number, email: String(lead.email || ''), error: 'Network error' });
        }
      }

      setProgress(Math.round(((i + BATCH_SIZE) / csvRows.length) * 100));
    }

    setResult({ imported, duplicates, errors, error_rows: errorRows });
    setStep('done');
  };

  const downloadErrors = () => {
    if (!result) return;
    const rows = [['Row', 'Email', 'Error'], ...result.error_rows.map((r) => [String(r.row), r.email, r.error])];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-errors.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/leads">
          <button className="p-2 rounded-lg hover:bg-white/10 text-navy-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Import Leads</h1>
          <p className="text-navy-400 text-sm mt-1">Upload a CSV from LinkedIn, HubSpot, Salesforce, or any tool</p>
        </div>
      </div>

      {step === 'upload' && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-white/15 rounded-2xl p-16 text-center hover:border-brand-500/40 transition-colors"
        >
          <Upload className="w-12 h-12 text-navy-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">Drop your CSV here</h2>
          <p className="text-navy-400 text-sm mb-6">
            Supports CSV from LinkedIn Sales Navigator, HubSpot, Salesforce, Apollo, Clay, and generic CSVs.
            <br />Email column is required — all other columns are auto-mapped.
          </p>
          <Button variant="gradient" onClick={() => fileRef.current?.click()}>
            <Upload className="w-4 h-4" /> Choose CSV File
          </Button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          <div className="mt-6 text-xs text-navy-600">Max file size: 10MB · Up to 10,000 leads per import</div>
        </div>
      )}

      {step === 'map' && (
        <div className="space-y-6">
          <div className="bg-glass rounded-xl p-4 flex items-center gap-3">
            <FileText className="w-5 h-5 text-brand-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-white">{csvRows.length} rows detected</div>
              <div className="text-xs text-navy-400">{csvHeaders.length} columns — review the mapping below</div>
            </div>
          </div>

          <div className="bg-glass rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h2 className="font-semibold text-white text-sm">Column Mapping</h2>
              <p className="text-xs text-navy-400 mt-1">We auto-detected the column mapping. Review and adjust as needed.</p>
            </div>
            <div className="divide-y divide-white/5">
              {mapping.map((m, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-48 text-sm text-navy-300 truncate">{m.csvCol}</div>
                  <div className="text-navy-600">→</div>
                  <select
                    value={m.field}
                    onChange={(e) => setMapping((prev) => prev.map((mm, idx) => idx === i ? { ...mm, field: e.target.value } : mm))}
                    className="bg-navy-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white flex-1"
                  >
                    {LEAD_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  <div className="w-32 text-xs text-navy-500 truncate">
                    {csvRows[0]?.[i] || '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-glass rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h2 className="font-semibold text-white text-sm">Preview (first 3 rows)</h2>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="text-xs text-navy-300">
                <thead>
                  <tr>
                    {mapping.filter((m) => m.field).map((m, i) => (
                      <th key={i} className="px-3 py-1 text-left text-navy-500 capitalize">{m.field}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.slice(0, 3).map((row, ri) => (
                    <tr key={ri}>
                      {mapping.map((m, ci) => m.field ? (
                        <td key={ci} className="px-3 py-1 max-w-[200px] truncate">{row[ci]}</td>
                      ) : null)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('upload')}><ArrowLeft className="w-4 h-4" />Back</Button>
            <Button variant="gradient" onClick={handleImport} disabled={!mapping.some((m) => m.field === 'email')}>
              Import {csvRows.length} Leads
            </Button>
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div className="bg-glass rounded-xl p-16 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">Importing leads...</h2>
          <div className="w-full max-w-xs mx-auto bg-navy-700 rounded-full h-2 mb-2">
            <div className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-navy-400 text-sm">{progress}% complete · Do not close this page</p>
        </div>
      )}

      {step === 'done' && result && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{result.imported}</div>
              <div className="text-xs text-green-400 mt-1">Imported</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5 text-center">
              <div className="text-3xl font-bold text-white">{result.duplicates}</div>
              <div className="text-xs text-yellow-400 mt-1">Duplicates (skipped)</div>
            </div>
            <div className={`${result.errors > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-navy-800/50 border-white/10'} border rounded-xl p-5 text-center`}>
              {result.errors > 0 ? <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" /> : null}
              <div className="text-3xl font-bold text-white">{result.errors}</div>
              <div className={`text-xs mt-1 ${result.errors > 0 ? 'text-red-400' : 'text-navy-500'}`}>Errors</div>
            </div>
          </div>

          {result.error_rows.length > 0 && (
            <div className="bg-glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white text-sm">Failed Rows</h3>
                <Button variant="outline" size="sm" onClick={downloadErrors}><Download className="w-3 h-3" />Download</Button>
              </div>
              <div className="space-y-1">
                {result.error_rows.slice(0, 5).map((r) => (
                  <div key={r.row} className="text-xs text-red-400 bg-red-500/5 rounded px-3 py-1.5">
                    Row {r.row}: {r.email} — {r.error}
                  </div>
                ))}
                {result.error_rows.length > 5 && <div className="text-xs text-navy-500">...and {result.error_rows.length - 5} more (download CSV)</div>}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => { setStep('upload'); setResult(null); setCsvHeaders([]); setCsvRows([]); }}>
              Import Another File
            </Button>
            <Link href="/dashboard/leads">
              <Button variant="gradient">View All Leads</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
