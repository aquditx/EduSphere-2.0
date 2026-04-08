import { Link } from "react-router-dom";
import CourseShowcase from "@/components/marketing/CourseShowcase.jsx";
import FeatureGrid from "@/components/marketing/FeatureGrid.jsx";
import HeroSection from "@/components/marketing/HeroSection.jsx";
import MarketingFooter from "@/components/marketing/MarketingFooter.jsx";
import MarketingHeader from "@/components/marketing/MarketingHeader.jsx";
import PricingSection from "@/components/marketing/PricingSection.jsx";
import InstructorsSection from "../components/marketing/InstructorsSections";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)]">
      <MarketingHeader />
      <HeroSection />
      <FeatureGrid />
      <TeachStrip />
      <CourseShowcase />
      <InstructorsSection/>
      <PricingSection />
      <MarketingFooter />
    </div>
  );
}

function TeachStrip() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
      <div className="surface flex flex-col gap-6 rounded-[2rem] border border-slate-200 bg-slate-50 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Turn your expertise into income. Teach on EduSphere.</h2>
          <p className="mt-2 text-sm text-slate-500">Create your public instructor profile, publish polished courses, and grow a catalog learners can trust.</p>
        </div>
        <div className="flex flex-col gap-4 lg:items-end">
          <Link to="/register?role=instructor" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 lg:w-auto">
            Apply as instructor
          </Link>
          <p className="text-sm text-slate-500">500+ instructors · 10,000+ students · 4.7 avg rating</p>
        </div>
      </div>
    </section>
  );
}
