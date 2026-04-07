import CourseShowcase from "@/components/marketing/CourseShowcase.jsx";
import FeatureGrid from "@/components/marketing/FeatureGrid.jsx";
import HeroSection from "@/components/marketing/HeroSection.jsx";
import MarketingHeader from "@/components/marketing/MarketingHeader.jsx";
import PricingSection from "@/components/marketing/PricingSection.jsx";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)]">
      <MarketingHeader />
      <HeroSection />
      <FeatureGrid />
      <CourseShowcase />
      <PricingSection />
    </div>
  );
}

