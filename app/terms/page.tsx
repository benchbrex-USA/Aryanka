import { generateMetadata } from '@/lib/seo/metadata';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';

export const metadata = generateMetadata({
  title: 'Terms of Service — Aryanka',
  description: 'The terms and conditions governing your use of Aryanka.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-navy-900 grid-bg">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-32">
        <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-navy-400 text-sm mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-navy-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using Aryanka, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Use of Service</h2>
            <p>You may use Aryanka only for lawful purposes. You agree not to use our platform to send spam, violate platform API terms, infringe intellectual property, or engage in any illegal activity.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Your Account</h2>
            <p>You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorized access at security@aryanka.io.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Subscription & Billing</h2>
            <p>Paid plans are billed monthly or annually. You may cancel at any time; access continues until the end of the billing period. We do not offer prorated refunds except where required by applicable law.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Intellectual Property</h2>
            <p>Aryanka and its original content, features, and functionality are owned by Aryanka and protected by intellectual property laws. Content you create and upload remains yours.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Limitation of Liability</h2>
            <p>Aryanka is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. Contact</h2>
            <p>For questions about these terms, contact us at <span className="text-brand-400">legal@aryanka.io</span>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
