'use client';

const logos = [
  'Razorpay', 'Zerodha', 'Freshworks', 'CRED', 'Meesho',
  'ShareChat', 'Postman', 'BrowserStack', 'Zoho', 'Chargebee',
];

export default function SocialProof() {
  const doubled = [...logos, ...logos];

  return (
    <section className="py-20 relative overflow-hidden border-y border-white/[0.04]"
      style={{ background: 'rgba(255,255,255,0.01)' }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-8">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-white/20">
          Trusted by 500+ fast-growing companies
        </p>
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden">
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #080808, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #080808, transparent)' }} />

        <div className="flex animate-marquee whitespace-nowrap">
          {doubled.map((logo, i) => (
            <div
              key={i}
              className="inline-flex items-center mx-8 text-sm font-semibold tracking-wide transition-colors duration-300 hover:text-white/50 cursor-default"
              style={{ color: 'rgba(255,255,255,0.15)' }}
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
