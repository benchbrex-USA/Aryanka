import { generateMetadata } from '@/lib/seo/metadata';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';

export const metadata = generateMetadata({
  title: 'Privacy Policy — Aryanka',
  description: 'How Aryanka collects, uses, and protects your personal data.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-navy-900 grid-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-32">
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-navy-400 text-sm mb-10">Last updated: March 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-navy-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Information We Collect</h2>
            <p>We collect information you provide directly to us (name, email, company) when you sign up, book a demo, or use our services. We also collect usage data, log files, and analytics to improve our platform.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. How We Use Your Information</h2>
            <p>We use your information to provide and improve our services, send you transactional emails (account confirmations, password resets), and — with your consent — marketing communications about Aryanka updates.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Data Storage</h2>
            <p>Your data is stored securely in Supabase (hosted on AWS). We use industry-standard encryption for data at rest and in transit. We do not sell your data to third parties.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Cookies</h2>
            <p>We use essential cookies for authentication sessions. We may use analytics cookies (Google Analytics) to understand platform usage. You can opt out at any time via browser settings.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. To exercise your rights, email us at privacy@aryanka.io and we will respond within 30 days.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Contact</h2>
            <p>For privacy-related questions, contact us at <span className="text-brand-400">privacy@aryanka.io</span>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
