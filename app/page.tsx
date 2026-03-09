import Navbar from '@/components/marketing/Navbar';
import Hero from '@/components/marketing/Hero';
import Features from '@/components/marketing/Features';
import HowItWorks from '@/components/marketing/HowItWorks';
import SocialProof from '@/components/marketing/SocialProof';
import Pricing from '@/components/marketing/Pricing';
import FAQ from '@/components/marketing/FAQ';
import FinalCTA from '@/components/marketing/FinalCTA';
import Footer from '@/components/marketing/Footer';
import ExitIntentPopup from '@/components/marketing/ExitIntentPopup';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-navy-900">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <SocialProof />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
      <ExitIntentPopup />
    </main>
  );
}
