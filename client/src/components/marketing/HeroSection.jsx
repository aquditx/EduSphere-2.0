import { ArrowRight, PlayCircle, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import AvatarStack from "@/components/common/AvatarStack.jsx";
import Badge from "@/components/common/Badge.jsx";
import Button from "@/components/common/Button.jsx";

export default function HeroSection() {
  function handleWatchPreview() {
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <div className="pt-8">
        <Badge className="bg-brand-50 text-brand-700">
          <Sparkles className="mr-2 h-4 w-4" /> Cohort-grade LMS for modern teams
        </Badge>
        <h1 className="heading-xl mt-6 max-w-3xl">
          Learn faster with a polished LMS built for students, instructors, and teams.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500">
          Launch courses, track outcomes, and deliver an exceptional learner experience with a modern SaaS-style interface.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link to="/courses" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Explore platform <ArrowRight className="h-4 w-4" />
          </Link>
          <Button variant="secondary" className="gap-2" onClick={handleWatchPreview}>
            <PlayCircle className="h-4 w-4" /> Watch preview
          </Button>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <AvatarStack />
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            Rated 4.9 by 18,000+ learners across product, dev, and AI tracks.
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 rounded-[2rem] bg-hero-grid blur-3xl" />
        <div className="surface relative overflow-hidden rounded-[2rem] p-5">
          <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Continue watching</p>
                <h3 className="mt-2 text-2xl font-semibold">React Performance Lab</h3>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-2 text-sm">48% done</div>
            </div>
            <div className="mt-8 h-56 rounded-[1.5rem] bg-[linear-gradient(135deg,#0f172a,#1d4ed8,#7c3aed)] p-6">
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-center justify-between text-sm text-white/80">
                  <span>Lesson 11 of 36</span>
                  <span>19:05</span>
                </div>
                <div>
                  <p className="text-sm text-white/70">Now playing</p>
                  <p className="mt-2 text-2xl font-semibold">Shipping monitoring hooks</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              ["92%", "Completion uplift"],
              ["23k", "Monthly learners"],
              ["4.8/5", "Instructor rating"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xl font-semibold text-slate-950">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
