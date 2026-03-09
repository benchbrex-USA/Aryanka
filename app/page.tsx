import Navbar from '@/components/marketing/Navbar';
import Hero from '@/components/marketing/Hero';
import SocialProof from '@/components/marketing/SocialProof';
import Features from '@/components/marketing/Features';
import HowItWorks from '@/components/marketing/HowItWorks';
import Platforms from '@/components/marketing/Platforms';
import Pricing from '@/components/marketing/Pricing';
import Testimonials from '@/components/marketing/Testimonials';
import FAQ from '@/components/marketing/FAQ';
import FinalCTA from '@/components/marketing/FinalCTA';
import Footer from '@/components/marketing/Footer';
import ExitIntentPopup from '@/components/marketing/ExitIntentPopup';

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: '#080808' }}>
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Platforms />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
      <ExitIntentPopup />
    </main>
  );
}
