import { generateMetadata } from '@/lib/seo/metadata';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';
import DemoBookingForm from '@/components/forms/DemoBookingForm';
import { CheckCircle, Clock, Users, BarChart3 } from 'lucide-react';

export const metadata = generateMetadata({
  title: 'Book a Demo',
  description: 'Get a personalized 30-minute walkthrough of Aryanka — see exactly how to generate leads and grow your business organically.',
  path: '/book-demo',
});

const benefits = [
  { icon: Clock, text: '30-minute personalized walkthrough' },
  { icon: Users, text: 'Tailored to your B2B or B2C use case' },
  { icon: BarChart3, text: 'See a live demo with your actual metrics' },
  { icon: CheckCircle, text: 'Get a custom organic growth plan — free' },
];

export default function BookDemoPage() {
  return (
    <main className="min-h-screen bg-navy-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Info */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              See Aryanka{' '}
              <span className="text-gradient">in Action</span>
            </h1>
            <p className="text-lg text-navy-300 mb-8 leading-relaxed">
              Book a free 30-minute demo and see exactly how Aryanka can help
              you generate 300–500 qualified leads per month — with zero ad
              spend.
            </p>

            <div className="space-y-4 mb-10">
              {benefits.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-brand-400" />
                  </div>
                  <span className="text-navy-300 text-sm">{text}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="bg-glass rounded-xl p-6">
              <blockquote className="text-sm text-navy-300 italic mb-4">
                "The demo alone gave us 3 actionable strategies we implemented
                the same week. Within 30 days we had 87 new qualified leads —
                all organic."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-xs">
                  PS
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Priya Sharma</div>
                  <div className="text-xs text-navy-500">Founder, DataPilot SaaS</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-glass rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Book Your Free Demo</h2>
            <DemoBookingForm />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
