import { notFound } from 'next/navigation';

interface ReportData {
  report: {
    id: string;
    name: string;
    type: string;
    created_at: string;
    expires_at: string | null;
  };
  data: {
    report_type: string;
    generated_at: string;
    metrics: {
      open_rate: number;
      click_rate: number;
      total_leads: number;
      conversion_rate: number;
      emails_sent: number;
      bounced: number;
    };
    top_sources: { source: string; leads: number }[];
  };
}

async function fetchReport(token: string): Promise<ReportData | null> {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://aryanka.io';

  try {
    const res = await fetch(`${appUrl}/api/reports/${token}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;
    return res.json() as Promise<ReportData>;
  } catch {
    return null;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function PublicReportPage({
  params,
}: {
  params: { token: string };
}) {
  const report = await fetchReport(params.token);

  if (!report) {
    notFound();
  }

  const { metrics, top_sources } = report.data;
  const maxLeads = Math.max(...top_sources.map((s) => s.leads), 1);

  const metricCards = [
    {
      label: 'Open Rate',
      value: `${metrics.open_rate}%`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      accent: '#00D4FF',
    },
    {
      label: 'Click Rate',
      value: `${metrics.click_rate}%`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
        </svg>
      ),
      accent: '#3B82F6',
    },
    {
      label: 'Total Leads',
      value: metrics.total_leads.toLocaleString(),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      accent: '#10B981',
    },
    {
      label: 'Conversion Rate',
      value: `${metrics.conversion_rate}%`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      accent: '#8B5CF6',
    },
  ];

  return (
    <div
      style={{
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        minHeight: '100vh',
        background: '#080B14',
        color: '#E2E8F0',
      }}
    >
      {/* Top nav bar */}
      <header
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 32px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(8,11,20,0.95)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Aryanka logo top-left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #00D4FF, #3B82F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '-0.3px' }}>
            Aryanka
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 20,
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.25)',
              color: '#10B981',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Shared Report
          </span>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Report title block */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
            {report.data.report_type.toUpperCase()} REPORT
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            {report.report.name}
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
            Generated {formatDate(report.data.generated_at)}
            {report.report.expires_at && (
              <> &middot; Expires {formatDate(report.report.expires_at)}</>
            )}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 40 }} />

        {/* Key metrics grid — 4 cards */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 20px' }}>
            Key Metrics
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: 16,
            }}
          >
            {metricCards.map((card) => (
              <div
                key={card.label}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14,
                  padding: '22px 20px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Subtle accent glow top-right */}
                <div
                  style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: card.accent,
                    opacity: 0.06,
                    pointerEvents: 'none',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: `rgba(${card.accent === '#00D4FF' ? '0,212,255' : card.accent === '#3B82F6' ? '59,130,246' : card.accent === '#10B981' ? '16,185,129' : '139,92,246'},0.1)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {card.icon}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>{card.label}</span>
                </div>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Top sources */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 20px' }}>
            Top Lead Sources
          </h2>
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {top_sources.map((source, idx) => (
              <div
                key={source.source}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px',
                  borderBottom: idx < top_sources.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#64748B',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#CBD5E1', flex: '0 0 160px' }}>
                  {source.source}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.round((source.leads / maxLeads) * 100)}%`,
                      background: 'linear-gradient(90deg, #00D4FF, #3B82F6)',
                      borderRadius: 3,
                    }}
                  />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', flexShrink: 0, minWidth: 40, textAlign: 'right' }}>
                  {source.leads.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Additional stats row */}
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 20px' }}>
            Campaign Stats
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
            }}
          >
            {[
              { label: 'Emails Sent', value: metrics.emails_sent.toLocaleString() },
              { label: 'Bounce Rate', value: `${metrics.bounced}%` },
              { label: 'Total Leads', value: metrics.total_leads.toLocaleString() },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  padding: '18px 20px',
                }}
              >
                <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 6px', fontWeight: 500 }}>{stat.label}</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: 0 }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Powered by Aryanka footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: 'rgba(8,11,20,0.95)',
        }}
      >
        <span style={{ fontSize: 12, color: '#475569' }}>Powered by</span>
        <a
          href="https://aryanka.io"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            textDecoration: 'none',
            color: '#fff',
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #00D4FF, #3B82F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg, #00D4FF, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Aryanka
          </span>
        </a>
      </footer>
    </div>
  );
}
