'use client';

import { useState, useEffect } from 'react';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

interface FormSchema {
  title?: string;
  description?: string;
  fields?: FormField[];
  button_text?: string;
  success_message?: string;
}

const DEFAULT_FIELDS: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'Jane Smith', required: true },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'jane@company.com', required: true },
  { name: 'company', label: 'Company', type: 'text', placeholder: 'Acme Corp' },
  { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Tell us about your goals...' },
];

const DEFAULT_SCHEMA: FormSchema = {
  title: 'Get in touch',
  description: "Fill out the form and we'll respond within 24 hours.",
  fields: DEFAULT_FIELDS,
  button_text: 'Send Message',
  success_message: "Thanks for reaching out. We'll be in touch within 24 hours.",
};

export default function EmbedFormPage({ params }: { params: { id: string } }) {
  const [schema, setSchema] = useState<FormSchema>(DEFAULT_SCHEMA);
  const [form, setForm] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch form schema from DB (public endpoint, no auth needed)
  useEffect(() => {
    fetch(`/api/forms/public/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.form && data.form.fields) {
          setSchema({
            title: data.form.name || DEFAULT_SCHEMA.title,
            description: data.form.description || DEFAULT_SCHEMA.description,
            fields: data.form.fields as FormField[],
            button_text: data.form.button_text || DEFAULT_SCHEMA.button_text,
            success_message: data.form.success_message || DEFAULT_SCHEMA.success_message,
          });
        }
      })
      .catch(() => {}); // silently use defaults
  }, [params.id]);

  const fields = schema.fields || DEFAULT_FIELDS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    // Map form fields to lead payload
    const payload: Record<string, string> = {
      source: `embed-form-${params.id}`,
      utm_source: 'embed',
      utm_medium: 'iframe',
      utm_campaign: params.id,
    };
    fields.forEach((f) => {
      if (form[f.name]) payload[f.name] = form[f.name];
    });

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus('success');
        setForm({});
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>You&rsquo;re in!</h2>
          <p style={{ color: '#94A3B8', fontSize: 14, margin: 0 }}>
            {schema.success_message || DEFAULT_SCHEMA.success_message}
          </p>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 500, color: '#94A3B8', marginBottom: 6,
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', background: '#0F172A', padding: '24px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>
            {schema.title}
          </h2>
          <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>{schema.description}</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fields.map((field) => (
            <div key={field.name}>
              <label style={labelStyle}>
                {field.label}{field.required && ' *'}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  placeholder={field.placeholder}
                  required={field.required}
                  rows={4}
                  value={form[field.name] || ''}
                  onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
                />
              ) : field.type === 'select' ? (
                <select
                  required={field.required}
                  value={form[field.name] || ''}
                  onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Select...</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={form[field.name] || ''}
                  onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                  style={inputStyle}
                />
              )}
            </div>
          ))}

          {status === 'error' && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#FCA5A5', fontSize: 13 }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              padding: '12px 20px',
              background: status === 'loading' ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3B82F6, #10B981)',
              border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
            }}
          >
            {status === 'loading' ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Sending...
              </>
            ) : (schema.button_text || 'Send Message')}
          </button>

          <p style={{ color: '#475569', fontSize: 11, textAlign: 'center', margin: 0 }}>
            Powered by{' '}
            <a href="https://aryanka.io" target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', textDecoration: 'none' }}>
              Aryanka
            </a>
          </p>
        </form>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #475569; }
        input:focus, textarea:focus, select:focus { border-color: rgba(59,130,246,0.5) !important; }
      `}</style>
    </div>
  );
}
