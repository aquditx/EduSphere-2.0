import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingFooter from "@/components/marketing/MarketingFooter.jsx";
import MarketingHeader from "@/components/marketing/MarketingHeader.jsx";

export default function InstructorAppliedPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)]">
      <MarketingHeader />
      <main className="mx-auto flex max-w-7xl justify-center px-6 py-20 lg:px-8">
        <section className="surface w-full max-w-[480px] p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-slate-950">Application received!</h1>
          <p className="mt-4 text-sm leading-6 text-slate-500">
            Thanks for applying to teach on EduSphere. We&apos;ll review your application and send you an email within 2-3 business days.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link to="/courses" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Browse courses while you wait
            </Link>
            <Link to="/" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
              Back to home
            </Link>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
