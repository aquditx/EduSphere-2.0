import { BarChart3, BookOpen, CircleDollarSign, GraduationCap, LayoutTemplate, LifeBuoy, PenSquare, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingFooter from "@/components/marketing/MarketingFooter.jsx";
import MarketingHeader from "@/components/marketing/MarketingHeader.jsx";

const steps = [
  {
    icon: BookOpen,
    title: "Create your profile",
    body: "Share your expertise, teaching topics, and experience so learners know why to trust you.",
  },
  {
    icon: PenSquare,
    title: "Build your course",
    body: "Use EduSphere's structured course tools to organize lessons, previews, and outcomes.",
  },
  {
    icon: CircleDollarSign,
    title: "Earn from enrollments",
    body: "Publish your catalog, reach learners, and grow income through every successful enrollment.",
  },
];

const features = [
  {
    icon: LayoutTemplate,
    title: "Powerful course builder",
    body: "Organize modules, lessons, and outcomes in a workflow designed for polished course delivery.",
  },
  {
    icon: BarChart3,
    title: "Real-time analytics",
    body: "Track enrollments, revenue, and learner progress with dashboards that stay easy to scan.",
  },
  {
    icon: Wallet,
    title: "Flexible pricing",
    body: "Set pricing that fits your audience and update offers as your catalog and demand evolve.",
  },
  {
    icon: LifeBuoy,
    title: "Student support tools",
    body: "Keep learners moving with a platform that makes course navigation and follow-through feel effortless.",
  },
];

const featuredInstructors = [
  { id: "user-instructor-1", name: "Aisha Morgan", headline: "Head of Product Design at Halo", students: "4,200 students" },
  { id: "user-instructor-2", name: "Noah Bennett", headline: "Frontend Architect at Elevate", students: "3,100 students" },
  { id: "user-instructor-3", name: "Mina Patel", headline: "Data science educator and analytics consultant", students: "2,600 students" },
];

export default function TeachPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_25%),linear-gradient(180deg,#ffffff_0%,#eef4ff_100%)]">
      <MarketingHeader />

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-12 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:pt-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Teach on EduSphere</p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight text-slate-950">Share your knowledge. Teach on EduSphere.</h1>
            <p className="mt-6 text-lg leading-8 text-slate-500">Join thousands of instructors reaching learners worldwide.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register?role=instructor" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Apply as instructor
              </Link>
              <Link to="/login?role=instructor" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                Sign in as instructor
              </Link>
            </div>
          </div>

          <div className="surface relative overflow-hidden rounded-[2rem] p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.08),transparent_30%)]" />
            <div className="relative grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white">
                <p className="text-sm text-slate-300">Instructor growth</p>
                <p className="mt-3 text-3xl font-semibold">+38%</p>
                <p className="mt-2 text-sm text-slate-300">Average enrollment lift after publishing a second course.</p>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6">
                <p className="text-sm text-slate-500">What you can manage</p>
                <div className="mt-5 space-y-3">
                  {["Course creation", "Analytics", "Revenue tracking", "Student progress"].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                      <span>{item}</span>
                      <span className="text-brand-600">Ready</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 sm:col-span-2">
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    ["10,000+", "Students"],
                    ["500+", "Courses"],
                    ["4.7", "Average rating"],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-2xl font-semibold text-slate-950">{value}</p>
                      <p className="mt-1 text-sm text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white/70">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 text-center sm:grid-cols-3 lg:px-8">
            {["10,000+ Students", "500+ Courses", "4.7 Average rating"].map((item) => (
              <p key={item} className="text-lg font-semibold text-slate-950">{item}</p>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">A clean path from expertise to published course.</h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {steps.map(({ icon: Icon, title, body }) => (
              <article key={title} className="surface p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-950">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Why EduSphere</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Built for instructors who want control without extra friction.</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {features.map(({ icon: Icon, title, body }) => (
              <article key={title} className="surface p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-950">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Featured instructors</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">See how top educators show up on the platform.</h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featuredInstructors.map((instructor) => (
              <Link key={instructor.id} to={`/instructor/${instructor.id}/profile`} className="surface block p-6 transition hover:-translate-y-1 hover:shadow-panel">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                  {instructor.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">{instructor.name}</h3>
                <p className="mt-2 text-sm text-slate-500">{instructor.headline}</p>
                <div className="mt-5 inline-flex items-center rounded-2xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  {instructor.students}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-20 lg:px-8">
          <div className="surface rounded-[2rem] px-6 py-10 text-center md:px-10">
            <h2 className="text-3xl font-semibold text-slate-950">Ready to start teaching?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Create your instructor profile and start building a course learners will actually finish.</p>
            <Link to="/register?role=instructor" className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Apply as instructor
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
