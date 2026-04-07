import { Link, useLocation } from "react-router-dom";
import MarketingFooter from "@/components/marketing/MarketingFooter.jsx";
import MarketingHeader from "@/components/marketing/MarketingHeader.jsx";

const pageContent = {
  "/about": {
    title: "About EduSphere",
    body: "EduSphere brings together course discovery, learner progress, and instructor operations in one focused learning platform.",
  },
  "/blog": {
    title: "EduSphere Blog",
    body: "Updates on online learning, teaching workflows, and product improvements will live here as the platform grows.",
  },
  "/careers": {
    title: "Careers at EduSphere",
    body: "We are building tools that make learning feel more intentional, measurable, and enjoyable for both students and instructors.",
  },
  "/privacy": {
    title: "Privacy Policy",
    body: "EduSphere is committed to handling learner and instructor data responsibly, with clear expectations around collection and use.",
  },
  "/terms": {
    title: "Terms of Service",
    body: "These terms outline how EduSphere can be used by students, instructors, and platform operators in this demo environment.",
  },
};

export default function MarketingInfoPage() {
  const location = useLocation();
  const content = pageContent[location.pathname] || pageContent["/about"];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)]">
      <MarketingHeader />
      <main className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <section className="surface p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Company</p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-950">{content.title}</h1>
          <p className="mt-6 text-base leading-8 text-slate-600">{content.body}</p>
          <Link to="/" className="mt-8 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Back to home
          </Link>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
